var AWS = require("aws-sdk");
var IM = require('imagemagick');
var FS = require('fs');
var compressedJpegFileQuality = 0.80;
var compressedPngFileQuality = 0.95;
 
exports.handler = (event, context, callback) => {
    var s3 = new AWS.S3();
    var sourceBucket = "testintuz";
    var destinationBucket = "jenkinss312";
    var objectKey = event.Records[0].s3.object.key;
    var getObjectParams = {
        Bucket: sourceBucket,
        Key: objectKey
    };
    s3.getObject(getObjectParams, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log("S3 object retrieval get successful.");
            var resizedFileName = "/tmp/" + objectKey;
            var quality;
            if (resizedFileName.toLowerCase().includes("png")){
                quality = compressedPngFileQuality;
            }
            else {
                quality = compressedJpegFileQuality;
            }
            var resize_req = { width:"100%", height:"100%", srcData:data.Body, dstPath: resizedFileName, quality: quality, progressive: true, strip: true };
            IM.resize(resize_req, function(err, stdout) {
                if (err) {
                    throw err;
                }
                console.log('stdout:', stdout);
                var content = new Buffer(FS.readFileSync(resizedFileName));
                var uploadParams = { Bucket: destinationBucket, Key: objectKey, Body: content, ContentType: data.ContentType, StorageClass: "STANDARD" };
                s3.upload(uploadParams, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                    } else{
                        console.log("S3 compressed object upload successful.");
                    }
                });
            });
        }
    });
};