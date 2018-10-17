/**
 * Encrypt a message using the recipient's public key.
 * @param  {pubkey} String - Encrypted ASCII Armored public key.
 * @param  {message} String - Your message to the recipient.
 * @return {pgpMessage} String - Encrypted ASCII Armored message.
 */


async function  encrypt_message(pubkey, message) {

    var options = {
        message: openpgp.message.fromText(message),
        publicKeys: ( await openpgp.key.readArmored(pubkey)).keys
};
    openpgp.encrypt(options).then(function(ciphertext){
        document.getElementById("pgpMessage").value = ciphertext.data;
    });
}


$(document).ready(function(){
    $("button").click(function(){

        let message = $('textarea#plainTextMessage').val();
        let pubkey = $('textarea#pgpKey').val();
        encrypt_message(pubkey,message)

    });

});