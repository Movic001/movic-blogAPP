const express = require ('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3030;
const db =require('./db');
app.set("view engine", "ejs");
//app.use(express.static('public'));
 app.use(express.static(path.join(__dirname, 'public')));
 app.use(express.urlencoded({extended: true}));
 

app.get('/',(req,res)=>{
    return res.render('home')
});

app.get('/blog',(req,res)=>{
    return res.render('blog')
});

app.get('/blogs',(req,res)=>{
    return res.render('blogs')
});

//create a new blog post
app.post('/blog', (req, res) => {
    const { title, content } = req.body;
    
    if (!title) {
        return res.status(400).send('Invalid input, blog content is required.');
    }
    
    const sql = `INSERT INTO blog (\`title\`, \`content\` ) VALUES ( ? , ? )`;
    db.query(sql, [ title, content ], (err, results) => {
        if (err) {
            console.log(`Error trying to post blog: ${err.message}`);
            return res.status(500).send(`Error inserting into blog: ${err.message}`);
        }
        console.log(`sucuessfully posted to the database`)
       return res.status(201).redirect('/blogs')
    //    ({
    //     ID: results.insertId,
    //     message: `Blog post was created sucessfully`,
    //     PostedData: 
    //    });
    });
});


// Read all the list of blog article

app.get('/blogs', (req, res) => {
    const sql = 'SELECT * FROM blog';
    db.query(sql, (err, results) => {
        if (err) {
            console.log(`Error fetching blogs: ${err.message}`);
            return res.status(500).send(`Error fetching blogs: ${err.message}`);
        }
       return res.render('blogs', { blog: results });
    });
});


// Read a specific post by id
app.get('/blogs/:id', (req, res) => {
    const {id} = req.params;
     if(!id){
       return res.status(500).send(`no id available: ${id}`)
     }
     if(isNaN(id)){
        return res.status(500).send(`invalid id Format ${id}`)
      }

    const sql = 'SELECT * FROM blog WHERE \`id\`=?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.log(`Error fetching blogs: ${err.message}`);
            return res.status(500).send(`Error fetching blogs: ${err.message}`);
        }
        res.status(200).json(results);
    });
});


// Update a single article by id

app.put('/blogs/:id',(req,res)=>{
const { id } = req.params;
const { text } = req.body;
  if(!text || !id){
    return res.status(500).send(` id is required`)
  }
  //check if id is not valid
  if (isNaN(id)) {
    return res.status(400).send(`'Invalid id format: ${id}`);
}

const sql = `UPDATE blog SET \`text\`=? WHERE \`id\`=?`;
  db.query(sql,[text, id],(err,results)=>{
    if(err){
        return res.status(500).send(`enable to update from blog post: ${id}: ${err.message}`)
    }
        return res.status(200).json({
            message: `Blog post with ID: ${id} updated successfully.`,
            updatedText: text
        });
  });
});


// Delete a blog post by id
app.delete('/blogs/:id',(req,res)=>{
    const {id} = req.params;
    if(!id){
       return res.status(500).send(`Id is required: No id: ${id} found`)
    } 
        const sql= `DELETE FROM blog WHERE \`id\`=?`;
        db.query(sql,[id],(err,results)=>{
            if(err){
                res.status(500).send(`Error trying to delete id: ${id}`);
            }
            return res.status(201).send(` id: ${id} was deleted sucessfullt from DataBase`)
        });
});


app.use((req,res)=>{
    res.status(501).send(`Server Error PAGE NOT FOUND.......`)
})

app.listen(port,()=>{
    console.log(`server listening to port: ${port}`);
});