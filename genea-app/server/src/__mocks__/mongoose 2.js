const mongoose = {
  connect: jest.fn(),
  model: jest.fn(() => {
    return {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      updateMany: jest.fn(),
    };
  }),
  Schema: function () {
    return {};
  },
};

mongoose.Types = {
  ObjectId: jest.fn((id) => id),
};

module.exports = mongoose;
