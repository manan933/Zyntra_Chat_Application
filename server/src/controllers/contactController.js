import mongoose from 'mongoose';
import { Contact, PersonalGroup } from '../models/Contact.js';
import User from '../models/User.js';
import storageService from '../services/storageService.js';

const isMongoLive = () => mongoose.connection.readyState === 1;

// @desc    Get personal contacts and groups for current user
// @route   GET /api/contacts
// @access  Private
export const getContactsAndGroups = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!isMongoLive()) {
      const data = await storageService.getContactsAndGroups();
      
      // Filter offline data for the current user
      const isSoumya = req.user.primaryUsername === 'soumya' || req.user.email === 'soumya@zyntra.com';
      const userId = req.user._id?.toString() || req.user.id;
      
      const filteredContacts = isSoumya 
        ? data.contacts.filter(c => c.ownerId === userId || c.ownerId === 'user-1')
        : data.contacts.filter(c => c.ownerId === userId);
        
      const filteredGroups = isSoumya
        ? data.groups.filter(g => g.creatorId === userId || g.creatorId === 'user-1')
        : data.groups.filter(g => g.creatorId === userId);

      return res.status(200).json({
        success: true,
        contacts: filteredContacts,
        groups: filteredGroups,
      });
    }

    try {
      let contactQuery = {};
      let groupQuery = {};

      if (req.user) {
        const isSoumya = req.user.primaryUsername === 'soumya' || req.user.email === 'soumya@zyntra.com';
        if (!isSoumya) {
          contactQuery = { ownerId: req.user._id?.toString() || req.user.id };
          groupQuery = { creatorId: req.user._id?.toString() || req.user.id };
        } else {
          contactQuery = {
            $or: [
              { ownerId: req.user._id?.toString() || req.user.id },
              { ownerId: 'user-1' },
            ],
          };
          groupQuery = {
            $or: [
              { creatorId: req.user._id?.toString() || req.user.id },
              { creatorId: 'user-1' },
            ],
          };
        }
      }

      const contacts = await Contact.find(contactQuery).sort({ lastMessageTime: -1 }).lean();
      const groups = await PersonalGroup.find(groupQuery).sort({ lastMessageTime: -1 }).lean();

      // Dynamically populate live avatar and profile data from User collection
      const cleanUsernames = [
        ...new Set(
          contacts
            .map((c) => c.username?.trim().replace(/^@/, '').toLowerCase())
            .filter(Boolean)
        ),
      ];

      if (cleanUsernames.length > 0) {
        const matchedUsers = await User.find(
          { primaryUsername: { $in: cleanUsernames } },
          'primaryUsername name avatar bio status'
        ).lean();

        const userMap = new Map();
        matchedUsers.forEach((u) => {
          if (u.primaryUsername) {
            userMap.set(u.primaryUsername.toLowerCase(), u);
          }
        });

        contacts.forEach((c) => {
          const u = userMap.get(c.username?.trim().replace(/^@/, '').toLowerCase());
          if (u) {
            if (u.avatar) c.avatar = u.avatar;
            if (u.name) c.name = u.name;
            if (u.status) c.status = u.status;
            if (u.bio) c.bio = u.bio;
          }
        });
      }

      return res.status(200).json({
        success: true,
        contacts,
        groups,
      });
    } catch (dbErr) {
      console.warn('[Contacts] Mongoose query failed, using storageService:', dbErr.message);
      const data = await storageService.getContactsAndGroups();
      return res.status(200).json({
        success: true,
        contacts: data.contacts,
        groups: data.groups,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Search registered users by username or name to add as contacts
// @route   GET /api/contacts/search
// @access  Public / Private
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?._id || req.user?.id;

    if (!isMongoLive()) {
      const users = await storageService.searchUsers(q, currentUserId);
      return res.status(200).json({
        success: true,
        users,
      });
    }

    try {
      const filter = {};
      if (q && q.trim()) {
        const clean = q.trim().replace(/^@/, '');
        filter.$or = [
          { primaryUsername: { $regex: clean, $options: 'i' } },
          { name: { $regex: clean, $options: 'i' } },
          { email: { $regex: clean, $options: 'i' } },
        ];
      }

      if (currentUserId) {
        filter._id = { $ne: currentUserId };
      }

      const users = await User.find(filter)
        .select('name primaryUsername email avatar avatarType bio status')
        .limit(30);

      return res.status(200).json({
        success: true,
        users: users.map((u) => ({
          id: u._id,
          name: u.name,
          username: u.primaryUsername,
          email: u.email,
          avatar: u.avatar,
          avatarType: u.avatarType,
          bio: u.bio,
          status: u.status,
        })),
      });
    } catch (dbErr) {
      console.warn('[Search] Mongoose query failed, using storageService:', dbErr.message);
      const users = await storageService.searchUsers(q, currentUserId);
      return res.status(200).json({
        success: true,
        users,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new personal contact
// @route   POST /api/contacts
// @access  Public / Private
export const createContact = async (req, res, next) => {
  try {
    const { name, username, contactUsername, bio, avatar } = req.body;
    const targetUsername = username || contactUsername;

    if (!targetUsername?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Username is required to add a contact',
      });
    }

    const cleanUsername = targetUsername.trim().replace(/^@/, '').toLowerCase();

    if (!isMongoLive()) {
      const contact = await storageService.addContactByUsername(cleanUsername);
      return res.status(201).json({
        success: true,
        data: contact,
      });
    }

    try {
      const currentUserId = req.user?._id?.toString() || req.user?.id || 'user-1';
      const currentUserUsername = req.user?.primaryUsername?.toLowerCase() || 'user';
      const currentUserName = req.user?.name || currentUserUsername;
      const currentUserAvatar = req.user?.avatar || null;

      // Check if target user exists in database to fetch full profile info
      const matchedUser = await User.findOne({ primaryUsername: cleanUsername });

      const contactName = matchedUser?.name || name?.trim() || cleanUsername;
      const contactAvatar = matchedUser?.avatar || avatar || null;
      const contactBio = matchedUser?.bio || bio || '';

      const canonicalDmId = 'dm_' + [currentUserUsername, cleanUsername].sort().join('_');

      let contact = await Contact.findOne({ ownerId: currentUserId, username: cleanUsername });
      if (contact) {
        contact.id = canonicalDmId;
        await contact.save();
      } else {
        contact = await Contact.create({
          id: canonicalDmId,
          ownerId: currentUserId,
          name: contactName,
          username: cleanUsername,
          bio: contactBio,
          avatar: contactAvatar,
          status: matchedUser?.status || 'online',
          lastMessage: 'Connected on Zyntra',
          lastMessageTime: new Date(),
        });
      }

      if (matchedUser) {
        const targetUserId = matchedUser._id.toString();
        let reverseContact = await Contact.findOne({ ownerId: targetUserId, username: currentUserUsername });
        if (reverseContact) {
          reverseContact.id = canonicalDmId;
          await reverseContact.save();
        } else {
          await Contact.create({
            id: canonicalDmId,
            ownerId: targetUserId,
            name: currentUserName,
            username: currentUserUsername,
            bio: req.user?.bio || '',
            avatar: currentUserAvatar,
            status: req.user?.status || 'online',
            lastMessage: 'Connected on Zyntra',
            lastMessageTime: new Date(),
          });
        }
      }

      return res.status(201).json({
        success: true,
        data: contact,
      });
    } catch (dbErr) {
      console.warn('[CreateContact] Mongoose query failed, using storageService:', dbErr.message);
      const contact = await storageService.addContactByUsername(cleanUsername);
      return res.status(201).json({
        success: true,
        data: contact,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new personal group
// @route   POST /api/contacts/groups
// @access  Public / Private
export const createPersonalGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required',
      });
    }

    if (!isMongoLive()) {
      const group = await storageService.createGroup(name.trim(), description?.trim() || '');
      return res.status(201).json({
        success: true,
        data: group,
      });
    }

    try {
      const newId = `group-${Date.now()}`;
      const group = await PersonalGroup.create({
        id: newId,
        name: name.trim(),
        description: description?.trim() || '',
        membersCount: 1,
        lastMessage: '',
        lastMessageTime: new Date(),
        creatorId: req.user?._id?.toString() || req.user?.id || 'user-1',
      });

      return res.status(201).json({
        success: true,
        data: group,
      });
    } catch (dbErr) {
      console.warn('[CreateGroup] Mongoose query failed, using storageService:', dbErr.message);
      const group = await storageService.createGroup(name.trim(), description?.trim() || '');
      return res.status(201).json({
        success: true,
        data: group,
      });
    }
  } catch (error) {
    next(error);
  }
};
