/**
 * Script to download business logos from Facebook CDN
 * Run with: node download-logos.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const logos = [
  {
    name: 'bai-lechon-logo.jpg',
    url: 'https://scontent.fwlg3-2.fna.fbcdn.net/v/t39.30808-6/615965238_122109057459185032_8128239205597749354_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=-JsIqVGyS1sQ7kNvwHK_ybL&_nc_oc=Adljvc5Zl-giPb72AXHNo82j6t45FM8ZYPOP26x9YE8t6AXhpfyHClJi6pvq0gqavuvwG8O2ittSqGpBn4rrWykZ&_nc_zt=23&_nc_ht=scontent.fwlg3-2.fna&_nc_gid=v9eva0T5VipqgJY--2VL1g&oh=00_AfoWwhslWqNOljLj1zG_X_5VMJbCx-xU7sWjdLvXfTgxbw&oe=6973DF34'
  },
  {
    name: 'eskina-logo.jpg',
    url: 'https://scontent.fwlg3-2.fna.fbcdn.net/v/t39.30808-6/359467645_111338868690985_7257825876124420067_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=e9zdQTzU3TwQ7kNvwFTneDF&_nc_oc=Adk4iwJS8e0aJ3BfgsoKane__bc96gKTSBnl5xqmc8DK58_ldl2HdR4hRXUzX61WaVbZuU7Qm1YwiwCDF5n003qN&_nc_zt=23&_nc_ht=scontent.fwlg3-2.fna&_nc_gid=XQanNKLfBfmrNCocVdNh0Q&oh=00_Afp8nN5wyX6rDnjkKqk7odXw-gLab1Kb0dki8xT3Qd767w&oe=6973FC02'
  }
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filepath)}`);
          resolve();
        });
      } else {
        fs.unlink(filepath, () => {});
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Downloading business logos...\n');
  
  for (const logo of logos) {
    const filepath = path.join(imagesDir, logo.name);
    try {
      await downloadImage(logo.url, filepath);
    } catch (error) {
      console.error(`❌ Error downloading ${logo.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Done! Images saved to public/images/');
}

downloadAll();
