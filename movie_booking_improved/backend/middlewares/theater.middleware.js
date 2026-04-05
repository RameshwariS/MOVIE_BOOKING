const validateTheaterCreateRequest = (req, res, next) => {
  const { name, address, city, pinCode } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, err: 'Theater name is required', data: {}, msg: 'Bad Request' });
  }
  if (!address || !String(address).trim()) {
    return res.status(400).json({ success: false, err: 'Address is required', data: {}, msg: 'Bad Request' });
  }
  if (!city || !String(city).trim()) {
    return res.status(400).json({ success: false, err: 'City is required', data: {}, msg: 'Bad Request' });
  }
  if (!pinCode || isNaN(Number(pinCode))) {
    return res.status(400).json({ success: false, err: 'A valid pin code is required', data: {}, msg: 'Bad Request' });
  }

  next();
};

module.exports = { validateTheaterCreateRequest };
