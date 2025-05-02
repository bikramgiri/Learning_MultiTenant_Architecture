const makeUserTable = (sequelize,DataTypes)=>{
      const User = sequelize.define('user',{
            senderId : {
                  type : DataTypes.STRING,
                  allowNull : false                
            },
            receiverId : {
                  type : DataTypes.STRING,
                  allowNull : false                
            },
            message : {
                  type : DataTypes.STRING,
                  allowNull : false                
            }
            // time : {
            //       type : DataTypes.STRING,
            //       allowNull : false                
            // },
            // date : {
            //       type : DataTypes.STRING,
            //       allowNull : false                
            // },
            // isRead : {
            //       type : DataTypes.BOOLEAN,
            //       allowNull : false                
            // },
            // isDeleted : {
            //       type : DataTypes.BOOLEAN,
            //       allowNull : false                
            // },
            // isDeletedBySender : {
            //       type : DataTypes.BOOLEAN,
            //       allowNull : false                
            // },
            // isDeletedByReceiver : {
            //       type : DataTypes.BOOLEAN,
            //       allowNull : false                
            // },
            // isBlockedBySender : {
            //       type : DataTypes.BOOLEAN,
            //       allowNull : false                
            // },
            // isBlockedByReceiver : {
            //       type : DataTypes.BOOLEAN,
            //       allowNull : false                
            // },
            // isReportedBySender : {
            //       type : DataTypes.BOOLEAN,
            //       allowNull : false                
            // },
            // isReportedByReceiver : {
            //       type : DataTypes.BOOLEAN,
            //       allowNull : false                
            // }         
      })
      return User // Return the Blog model
}

module.exports = makeUserTable // Export the makeBlogTable function so that it can be used in other files