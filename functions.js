/**
 * Encrypt a message using the recipient's public key.
 * @param  {pubkey} String - Encrypted ASCII Armored public key.
 * @param  {message} String - Your message to the recipient.
 * @return {pgpMessage} String - Encrypted ASCII Armored message.
 */

"use strict";
async function  encrypt_message(pubkey, message)
{

    let options =  {
        message: openpgp.message.fromText(message),
        publicKeys: ( await openpgp.key.readArmored(pubkey)).keys
};
    openpgp.encrypt(options).then(function(ciphertext){
        document.getElementById("pgpMessage").value = ciphertext.data;
    }).catch(console.error);
}

async function decrypt_message(privkey,encryptedMessage,passphrase) {

    const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0];
    await privKeyObj.decrypt(passphrase).catch(console.error);

    const options = {
        message: await openpgp.message.readArmored(encryptedMessage).catch(console.error),    // parse armored message
        privateKeys: [privKeyObj]                               // for decryption
    }

    openpgp.decrypt(options).then(plaintext => {
        document.getElementById("plainTextMessage").value = plaintext.data;
    }).catch(console.error);
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

        $("#keygenerationButton").prop('disabled', false).text("Generate Key Pair").addClass('btn-dark').removeClass('btn-danger ');

        alert("Key generation completed");

        let zip = new JSZip();
        zip.file("privkey.asc", privkey);
        zip.file("pubkey.asc", pubkey);
        zip.generateAsync({type:"blob"})
            .then(function(content) {

                saveAs(content, "keys.zip");
            });
    }).catch(console.error);

}




function validateInput() {

    let email = $("#emailForm").val();

    let name = $("#nameForm").val();

    let password = $("#passForm").val();



    $("#keygenerationButton").prop('disabled', (email&&name&&password)==="");
    console.log( (email&&name&&password)==="");
    console.log(email,name,password);
    console.log("asdasd");

}


//$("#emailForm").keyup(validateInput);


$(document).ready(function(){


    $("#keygenerationButton").prop('disabled', true);




    $("#emailForm,#nameForm,#passForm").each(function(){
        $(this).keypress(validateInput).keyup(validateInput).keydown(validateInput);
    });



    $("#decryptButton").click(function(){

        let message = $('textarea#pgpMessage').val();
        let privateKey = $('textarea#pgpKey').val();
        decrypt_message(privateKey,message,document.getElementById("passphrasePGP").value)

    });

    $("#encryptButton").click(function(){

        let message = $('textarea#plainTextMessage').val();
        let pubkey = $('textarea#pgpKey').val();

            encrypt_message(pubkey, message);

    });

    $("#keygenerationButton").click(function () {

        $("#keygenerationButton").prop('disabled', true).text("Please wait this can take a while...").removeClass('btn-dark').addClass('btn-danger');

       generateRSA_Keys(document.getElementById("emailForm").value,document.getElementById("nameForm").value,document.getElementById("passForm").value);

    })




});