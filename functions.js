/**
 * Encrypt a message using the recipient's public key.
 * @param  {pubkey} String - Encrypted ASCII Armored public key.
 * @param  {message} String - Your message to the recipient.
 * @return {pgpMessage} String - Encrypted ASCII Armored message.
 */


async function  encrypt_message(pubkey, message) {

    let options = {
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

});