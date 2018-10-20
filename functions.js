/**
 * Encrypt a message using the recipient's public key.
 * @param  {pubkey} String - Encrypted ASCII Armored public key.
 * @param  {message} String - Your message to the recipient.
 * @return {pgpMessage} String - Encrypted ASCII Armored message.
 */

"use strict";
async function  encrypt_message(pubkey, message) {

    let options =  {
        message: openpgp.message.fromText(message),
        publicKeys: ( await openpgp.key.readArmored(pubkey)).keys
};
    openpgp.encrypt(options).then(function(ciphertext){
        document.getElementById("pgpMessage").value = ciphertext.data;
    });
}

async function decrypt_message(privkey,encryptedMessage,passphrase) {

    const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0];
    await privKeyObj.decrypt(passphrase);

    const options = {
        message: await openpgp.message.readArmored(encryptedMessage),    // parse armored message
        privateKeys: [privKeyObj]                               // for decryption
    }

    openpgp.decrypt(options).then(plaintext => {
        document.getElementById("plainTextMessage").value = plaintext.data;
    })
}

 async function generateRSA_Keys(email,name,password){

    let options = {
        userIds: [{ name:name, email:email }], // multiple user IDs
        numBits: 4096,                                            // RSA key size
        passphrase: password         // protects the private key
    };

    openpgp.generateKey(options).then(function(key) {


        let privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
        let pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
        let revocationSignature = key.revocationSignature; // '-----BEGIN PGP PUBLIC KEY BLOCK ... '.

        $("#modalLoginForm").modal('hide');
        $("#keyGenerator").prop('disabled', false).text("GENERATE");

        alert("Key generation completed");

        let zip = new JSZip();
        zip.file("privkey.txt", privkey);
        zip.file("pubkey.txt", pubkey);
        zip.generateAsync({type:"blob"})
            .then(function(content) {

                saveAs(content, "keys.zip");
            });
    });

}

$(document).ready(function(){

    $("#decryptButton").click(function(){

        let message = $('textarea#pgpMessage').val();
        let privateKey = $('textarea#pgpKey').val();
        decrypt_message(privateKey,message,document.getElementById("passphrasePGP").value)

    });

    $("#encryptButton").click(function(){

        let message = $('textarea#plainTextMessage').val();
        let pubkey = $('textarea#pgpKey').val();
        encrypt_message(pubkey,message)

    });

    $("#keyGenerator").click(function () {

        $("#keyGenerator").prop('disabled', true).text("Please wait this can take a while...");


       generateRSA_Keys(document.getElementById("emailForm").value,document.getElementById("nameForm").value,document.getElementById("passForm").value);



    })

});