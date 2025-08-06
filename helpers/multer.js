const multer = require('multer');
const path = require('path');

const diskStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../public/uploads/re-images'));
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+"-"+file.originalname)
    }
})


const storage = multer.memoryStorage();

const uploads = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const fileType = /image\/jpeg|image\/jpg|image\/png|image\/webp||image\/avif/;
        if(fileType.test(file.mimetype)){
            cb(null,true);
        }else{
            cb(new Error("Only Images Are Allowed"));
        }
    }

});

const uploadDisk = multer({
    storage: diskStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const fileType = /image\/jpeg|image\/jpg|image\/png|image\/webp/;
        if (fileType.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only Images Are Allowed"));
        }
    }
});



module.exports = {
    uploadDisk,
    uploads
};