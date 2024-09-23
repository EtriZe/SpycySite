var input = document.getElementById("inputProposal");
var videoIframe = document.getElementById("apercuVideo");

input.addEventListener("change", (event) => {
    videoIframe.src = convertToEmbeddedLink(input.value);
});


var btnProposer = document.getElementById("btnProposer");
btnProposer.addEventListener("click", (event) => {
    const musicData = {
        url: convertToEmbeddedLink(input.value)
    };

    fetch('/insertNewMusic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(musicData)
    })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            btnProposerSuccess();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

function btnProposerSuccess() {
    // // To disable:    
    // btnProposer.getElementById('id').style.pointerEvents = 'none';

    // //Change design to show success

    // //delay 2 secs
    // setTimeout(function() {
    //     //your code to be executed after 1 second
    //     // To re-enable:
    //     btnProposer.getElementById('id').style.pointerEvents = 'auto';
    // }, 2000);
   
}