const contactsService = require("../services/contacts.at.service");

exports.list = async (req, res) => {
  try {
    const contacts = await contactsService.listContacts();

    res.json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
