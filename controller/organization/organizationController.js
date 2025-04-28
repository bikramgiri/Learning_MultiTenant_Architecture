const db = require('../../model/index'); // Import the database connection and models
const {QueryTypes} = require('sequelize') // Import QueryTypes from Sequelize
const sequelize = db.sequelize // Get the sequelize instance from the db object

const generateRandomOrganizationNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000); // Generate a random number between 0 and 999999
}

exports.createOrganization = async (req, res) => {
    try {
        const userId = req.userId; // Get the user ID from the request object (assuming user is authenticated and ID is available)
        const { name,address,vatNo } = req.body; // Destructure the title and content from the request body
        const organizationNumber = generateRandomOrganizationNumber(); // Generate a random organization number
            if (!name || !address || !vatNo) { // Check if all required fields are present
                  res.send("Please send name, address and vatNo") // If not, send a response indicating the missing fields
            }
        
            // Create the organization in the database
            await sequelize.query(`CREATE TABLE IF NOT EXISTS organization_${organizationNumber} (
                id INT AUTO_INCREMENT PRIMARY KEY, 
                userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
                name VARCHAR(255), 
                address VARCHAR(255), 
                vatNo VARCHAR(255)
            )`, { 
                type: QueryTypes.CREATE 
            })


              // **Create the payment in the database   
        await sequelize.query(`CREATE TABLE IF NOT EXISTS payment_${organizationNumber} (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            partyName VARCHAR(255), 
            amount DECIMAL(10, 2), 
            date DATE, 
            description TEXT
        )`, { 
            type: QueryTypes.CREATE 
        })


            const userData = await db.users.findAll({ // Fetch the user data from the database
                where: {
                    id: userId // Use the user ID from the request object
                }
            });
            userData[0].currentOrganization = organizationNumber; // Add the organization number to the user data object
            await userData[0].save(); // Save the updated user data to the database


            await sequelize.query(`INSERT INTO organization_${organizationNumber} (name, address, vatNo, userId) VALUES (?, ?, ?, ?)`, {
                replacements: [name, address, vatNo, userId], // Use the user ID from the request object
                type: QueryTypes.INSERT // Specify the query type as INSERT
            }).then(() => { // Handle the successful insertion of the organization
                res.status(201).json({ message: 'Organization created successfully', organizationNumber }); // Respond with a success message and the organization number
            }
        )
    } catch (error) { // Handle any errors that occur during the process
        console.error('Error creating organization:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' }); // Respond with a 500 status code and an error message
    }
}


exports.createPayment = async (req, res) => {
    try {
        const organizationNumber = req.oraganizationNumber; // Get the organization number from the request object
        const { partyName,amount, date, description } = req.body; // Destructure the title and content from the request body

        if (!partyName || !amount || !date || !description) { // Check if all required fields are present
            res.send("Please send partyName, amount, date and description") // If not, send a response indicating the missing fields
        }
       
        await sequelize.query(`INSERT INTO payment_${organizationNumber} (partyName, amount, date, description) VALUES (?, ?, ?, ?)`, {
            replacements: [partyName, amount, date, description], // Use the user ID from the request object
            type: QueryTypes.INSERT // Specify the query type as INSERT
        }).then(() => { // Handle the successful insertion of the payment
            res.status(201).json({ message: 'Payment created successfully' }); // Respond with a success message
        })

    } catch (error) { // Handle any errors that occur during the process
        console.error('Error creating payment:', error); // Log the error for debugging
        res.status(500).json({ message: 'Internal server error' }); // Respond with a 500 status code and an error message
    }
}