const venom = require('venom-bot');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads'); // pastikan folder ini ada
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let client;

venom
  .create({
    session: 'cihuy',
    headless: 'new', //name of session
  })
  .then((clients) => {
    client = clients;
    start(clients);
})
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
  client.onMessage((message) => {
    if (message.body === 'Hi' && message.isGroupMsg === false) {
      client
        .sendText(message.from, 'Welcome Venom 🕷')
        .then((result) => {
          console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }
  });
}


app.post('/api/kirim-pesan', upload.none(), async (req, res) => {
    const { nomor, pesan } = req.body;
    // console.log(req.body.nomor);
    if (!client) return res.status(500).json({ message: 'Gaada Client' });
    if (!nomor) return res.status(400).json({ message: 'Nomor wajib diisi' });
    try {
        await client.sendText(nomor, pesan).then((result) => {
            res.status(200).json({ success: true });
            console.log('sukses'); //return object success
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
          });
    
        // res.json({ success: true, result });
      } catch (error) {
        console.error('Error kirim gagal bos:', error);
        res.status(500).json({ success: false, error });
    }
})

app.post('/api/kirim-report', upload.single('gambar'), async (req, res) => {
    const { nomor, pesan, user, note } = req.body;
    const gambar = req.file;
    const caption = `\`Dari: ${user}\` \n\`Deskripsi Pekerjaan:\`\n${pesan}.\n\`NOTE: ${note}\` \n\`Pesan otomatis dari Autoreport\``

    if (!client) return res.status(500).json({ message: 'Gaada Client' });
    if (!nomor || !gambar) return res.status(400).json({ message: 'Nomor dan gambar wajib diisi' });
    const filePath = path.resolve(gambar.path);
    try {
        console.log(`si ${user} report nih`);
        await client.sendImage(nomor, filePath, gambar.originalname, caption);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Gagal hapus file:', err);
            } else {
                console.log('File berhasil dihapus:', filePath);
            }
        });
        
        res.status(200).json({success: true});

    } catch (error) {
        res.status(500).json({success: false, error});
    }


})


app.listen(port, '0.0.0.0', () => {
    console.log(`Server berjalan di http://0.0.0.0:${port}`);
});