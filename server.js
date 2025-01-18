const express = require ('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3030;
const db =require('./db');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse URL-encoded bodies (from forms)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies (for API requests)
app.use(express.json());

// Set the view engine to EJS (Embedded JavaScript templating)
app.set("view engine", "ejs");

// Set the directory where the views are located
app.set('views', path.join(__dirname, 'views'));

app.get('/',(req,res)=>{
    return res.render('home')
});

app.get('/blog',(req,res)=>{
    return res.render('blog')
});


//create a new blog post
app.post('/blog', (req, res) => {
    const { title, content } = req.body;
    
    if (!title || !content) {
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
    });
});


// Read all the list of blog article

app.get('/blogs',(req,res)=>{
    const sql = 'SELECT * FROM blog';
    db.query(sql,(err,results)=>{
        if(err){ 
            console.log(`error invalid request: ${err.message}`);
        }
        // console.log(`successfully fetched all blog posts`);
         return res.status(200).render('blogs',{blogs : results});
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
        res.status(200).render('blogs', {blogs : results});
    });
});



// update page to update a blog post

app.get('/update/:id',(req,res)=>{
    const {id} = req.params;
    if(!id){
       return res.status(500).send(`Id is required: No id: ${id} found`)
    } 
    if(isNaN(id)){
        return res.status(500).send(`Invalid id format: ${id}`)
    }
    const sql = 'SELECT * FROM blog WHERE \`id\` = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.log(`Error fetching blogs: ${err.message}`);
            return res.status(500).send(`Error fetching blogs: ${err.message}`);
        } 
        return res.status(201).render('update', {blog : results});
    });
});


// Update a single article by id

app.post('/blogs/:id', (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content || !id) {
        return res.status(400).send(`Title and content are required.`);
    }

    // Check if id is a valid number
    if (isNaN(id)) {
        return res.status(400).send(`Invalid id format: ${id}`);
    }
    const sql = `UPDATE blog SET title = ?, content = ? WHERE id = ?`;
    db.query(sql, [title, content, id], (err, results) => {
        if (err) {
            return res.status(500).send(`Unable to update blog post with ID: ${id}: ${err.message}`);
        }
        console.log(`Blog post with ID: ${id} was Updated Successfully.`);
        return res.status(200).redirect(`/blogs/${id}`);
    });
});


// Delete a blog post by id
app.post('/delete/:id',(req,res)=>{
    const {id} = req.params;
    if(!id){
       return res.status(500).send(`Id is required: No id: ${id} found`)
    } 
        const sql= `DELETE FROM blog WHERE \`id\`= ? `;
        db.query(sql,[id],(err,results)=>{
            if(err){
                res.status(500).send(`Error trying to delete id: ${id}`);
            }
            //return res.status(201).send(` id: ${id} was deleted sucessfullt from DataBase`)
             return res.status(201).redirect('/blogs');
        });
});


app.use((req,res)=>{
    res.status(501).send(`Server Error PAGE NOT FOUND.......`)
})

app.listen(port,()=>{
    console.log(`server listening to port: ${port}`);
});