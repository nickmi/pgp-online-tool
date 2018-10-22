/**
 * Encrypt a message using the recipient's public key.
 * @param  {pubkey} String - Encrypted ASCII Armored public key.
 * @param  {message} String - Your message to the recipient.
 * @return {pgpMessage} String - Encrypted ASCII Armored message.
 */

"use strict";
async function encrypt_message(textAreaValues)
{
    let options =  {
        message: openpgp.message.fromText(textAreaValues.message),
        publicKeys: ( await openpgp.key.readArmored(textAreaValues.pubkey)).keys
};
    openpgp.encrypt(options).then(function(ciphertext){
        document.getElementById("pgpMessage").value = ciphertext.data;
    }).catch(console.error);
}

async function decrypt_message(valuesForDecryption) {

    const privKeyObj = (await openpgp.key.readArmored(valuesForDecryption.privateKey)).keys[0];
    await privKeyObj.decrypt(valuesForDecryption.passphrase).catch(console.error);

    const options = {
        message: await openpgp.message.readArmored(valuesForDecryption.message).catch(console.error),    // parse armored message
        privateKeys: [privKeyObj]                               // for decryption
    };

    openpgp.decrypt(options).then(plaintext => {
        document.getElementById("plainTextMessage").value = plaintext.data;
    }).catch(console.error);
}

  function generateRSA_Keys(formValues){

    let options = {
        userIds: [{ name:formValues.name, email:formValues.email }], // multiple user IDs
        numBits: 4096,                                            // RSA key size
        passphrase: formValues.password         // protects the private key
    };

    openpgp.generateKey(options).then(function(key) {


        let privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
        let pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
        let revocationSignature = key.revocationSignature; // '-----BEGIN PGP PUBLIC KEY BLOCK ... '.

        let zip = new JSZip();
        zip.file("privkey.asc", privkey);
        zip.file("pubkey.asc", pubkey);
        zip.generateAsync({type:"blob"})
            .then(function(content) {

                saveAs(content, "keys.zip");
            }).then(bringBackDomDefaults());


    }).catch(console.error);

}

function bringBackDomDefaults  ()  {

    $("#keygenerationButton").prop('disabled', false).text("Generate Key Pair").addClass('btn-dark').removeClass('btn-danger ');
    $("#encryptButton").prop('disabled', false).text("Generate Key Pair").addClass('btn-dark').removeClass('btn-danger ');
    $("#decryptButton").prop('disabled', false).addClass('btn-dark').removeClass('btn-danger ');
    alert("Key generation completed");
};

function validateInput() {

    let internalValuesOfDom={
        email : $("#emailForm").val(),
        name : $("#nameForm").val(),
        password : $("#passForm").val(),

    };

    $("#keygenerationButton").prop('disabled', (internalValuesOfDom.email&&internalValuesOfDom.name&&internalValuesOfDom.password)==="");
}

$(document).ready(function(){


    $("#keygenerationButton").prop('disabled', true);

    $("#emailForm,#nameForm,#passForm").each(function(){
        $(this).keypress(validateInput).keyup(validateInput).keydown(validateInput);
    });

    $("#decryptButton").click(function(){

        let valuesForDecryption = {

             message : $('textarea#pgpMessage').val(),
             privateKey : $('textarea#pgpKey').val(),
             passphrase: document.getElementById("passphrasePGP").value

        };

        decrypt_message(valuesForDecryption).catch(console.error);

    });

    $("#encryptButton").click(function(){

        let textAreaValues= {

            message : $('textarea#plainTextMessage').val(),
            pubkey :  $('textarea#pgpKey').val()
    };
            encrypt_message(textAreaValues);

    });

    $("#keygenerationButton").click(function () {

        $("#keygenerationButton").prop('disabled', true).text("Please wait this can take a while...").removeClass('btn-dark').addClass('btn-danger');
        $("#encryptButton").prop('disabled', true).removeClass('btn-dark').addClass('btn-danger');
        $("#decryptButton").prop('disabled', true).removeClass('btn-dark').addClass('btn-danger');

        let formValues ={

            email:document.getElementById("emailForm").value,
            name:document.getElementById("nameForm").value,
            pass:document.getElementById("passForm").value

        };

        generateRSA_Keys(formValues);

    })
});