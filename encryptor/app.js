
const express = require('express');
const app = express();

const http = require('http');
const fs = require('fs');
app.use('/assets', express.static(__dirname + '/assets'));





app.listen(process.env.PORT || 8888,()=>{
    console.log("server started on port 8888");
});
app.get('/', function(req, res){
    res.sendFile('/index.html', {root: "."});
  });

  // Not Used in the v0.1
app.post('/upload-avatar', async (req, res) => {
  try {
      if(!req.files) {
          res.send({
              status: false,
              message: 'No file uploaded'
          });
      } else {
          // use the name of the input field (i.e. "avatar") 
          // to retrieve the uploaded file
          let avatar = req.files.avatar;
          
          // use the mv() method to place the file in 
          // upload directory (i.e. "uploads")
          avatar.mv('./uploads/' + avatar.name);

          //send response
          res.send({
              status: true,
              message: 'File is uploaded'
          });
      }
  } catch (err) {
      res.status(500).send(err);
  }
});