const User = require('../schemas/user_schema');

const getUserData = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`Fetching data for user ID: ${userId}`);
        
        const user = await User.findById(userId).select('-Password'); // Exclude password from response

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getUserData,
};