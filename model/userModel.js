const makeUserTable = (sequelize,DataTypes)=>{
      const User = sequelize.define('user',{
            username : {
                  type : DataTypes.STRING,
                  allowNull : false                
            },
            email : {
                  type : DataTypes.STRING,
                  allowNull : false                
            },
            password : {
                  type : DataTypes.STRING,
                  allowNull : false                
            },
            currentOrganization : {
                  type : DataTypes.STRING,
                  allowNull : true                
            }           
      })
      return User // Return the Blog model
}

module.exports = makeUserTable // Export the makeBlogTable function so that it can be used in other files