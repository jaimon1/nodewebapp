

const pageNotFound = async (req,res)=>{
    try{
        res.render('pageNotFound');
    }catch(error){
        res.redirect('/page-not-found');
    }
}

const loadHomepage = async (req, res) => {
    try {
         res.render('index');
    } catch (error) {
        console.log('Home page not found');
         res.status(500).send('Server not Found');
    }
}

module.exports = {
    loadHomepage,
    pageNotFound
}