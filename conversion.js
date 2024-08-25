const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const stream = require('stream');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = {
    convertOggToMp3(oggBuffer) {
        return new Promise((resolve, reject) => {
            // Create a readable stream from the input OGG buffer
            const inputStream = new stream.PassThrough();
            inputStream.end(oggBuffer);
    
            // Create a writable stream to capture the output MP3 buffer
            const outputStream = new stream.PassThrough();
            const chunks = [];
    
            outputStream.on('data', (chunk) => {
                chunks.push(chunk);
            });
    
            outputStream.on('end', () => {
                const mp3Buffer = Buffer.concat(chunks);
                resolve(mp3Buffer);
            });
    
            outputStream.on('error', (err) => {
                reject(err);
            });
    
            // Use ffmpeg to perform the conversion
            ffmpeg(inputStream)
                .inputFormat('ogg')
                .format('mp3')
                .pipe(outputStream);
        });
    }
}