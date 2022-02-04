window.addEventListener('DOMContentLoaded', (event) => {
    const editButtons = document.querySelectorAll('.edit-button');
    editButtons.forEach((editButton) => {editButton.onclick = function() {editPost(editButton)}})

    const likeButtons = document.querySelectorAll('.like-button');
    likeButtons.forEach((likeButton) => {likeButton.onclick = function() {smashLikeButton(likeButton)}})

    const likedButtons = document.querySelectorAll('.liked-button');
    likedButtons.forEach((likedButton) => {likedButton.onclick = function() {unLike(likedButton)}})
});

function editPost(editButton) {

    const postWrapper = editButton.parentElement
    const contentArea = postWrapper.querySelector('.post-content');
    const originalText = contentArea.textContent;

    //create textarea
    contentArea.innerHTML = `<textarea class="new-content form-control">${originalText}</textarea>`;

    //remove edit button
    editButton.remove();

    //create a save button
    const saveButton = document.createElement('button');
    saveButton.innerHTML = 'Save';
    saveButton.classList.add('btn', 'btn-primary', 'save-button');
    postWrapper.appendChild(saveButton);

    saveButton.onclick = function() {savePost(postWrapper, contentArea)}

}

function savePost(postWrapper, contentArea) {

    const newContent = contentArea.querySelector('.new-content').value;
    const csrftoken = getCookie('csrftoken');
    const postID = postWrapper.id;

    // Send PUT request
    fetch("/edit", {
        method: "PUT",
        body: JSON.stringify({
            id: postID,
            content: newContent,
        }),
        headers: {"X-CSRFToken": csrftoken}
    })
    .then(async(response) => {
        // if success - update post's content
        if (response.status === 201) {
            restorePostWrapper(postWrapper, newContent);
            console.log(`post id: ${postID} edited successfully`);
        }
        // if error - show alert and reload the page
        else {
            let response_body = await response.json();

            throw new Error(response_body.error);                        
        }
    })
    .catch(error => {
        alert(error);
        location.reload();
    })
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function restorePostWrapper(postWrapper, newContent) {

    const contentArea = postWrapper.querySelector('.post-content');
    contentArea.innerHTML = newContent;
    const saveButton = postWrapper.querySelector('.save-button');

    //remove save button
    saveButton.remove();

    //recreate edit button
    const editButton = document.createElement('button');
    editButton.innerHTML = 'Edit';
    editButton.classList.add('btn', 'btn-outline-secondary', 'edit-button');
    postWrapper.appendChild(editButton);
}

function smashLikeButton(likeButton) {
    
    //get current likes, add one
    const postWrapper = likeButton.parentElement;
    const likeCounter = postWrapper.querySelector('.like-counter');
    const currLikes = parseInt(likeCounter.textContent);
    let newLikes = currLikes + 1;
    newLikes = newLikes.toString();

    // Send PUT request

    const csrftoken = getCookie('csrftoken');
    const postID = postWrapper.id;
    console.log(newLikes);

    fetch("/like", {
        method: "PUT",
        body: JSON.stringify({
            post_id: postID
        }),
        headers: {"X-CSRFToken": csrftoken}
    })
    .then(async(response) => {
        // if success - update post's content
        if (response.status === 201) {
            console.log(`post id: ${postID} like count updated successfully`);
        }
        // if error - show alert and reload the page
        else {
            let response_body = await response.json();

            throw new Error(response_body.error);                        
        }
    })
    .catch(error => {
        alert(error);
        location.reload();
    })    

    // update counter in DOM
    likeCounter.innerHTML = newLikes;

    likeButton.remove()

    //replace likebutton
    const likedButton = document.createElement('button');
    likedButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"></path>
</svg>
Liked`
    likedButton.classList.add('btn', 'btn-primary', 'liked-button');

    referenceNode = postWrapper.querySelector('.like-counter');
    postWrapper.insertBefore(likedButton, referenceNode);
}

function unLike(likedButton) {
    
    //get current likes, deduct one
    const postWrapper = likedButton.parentElement;
    const likeCounter = postWrapper.querySelector('.like-counter');
    const currLikes = parseInt(likeCounter.textContent);
    let newLikes = currLikes - 1;
    newLikes = newLikes.toString();

    // Send PUT request

    const csrftoken = getCookie('csrftoken');
    const postID = postWrapper.id;

    fetch("/unlike", {
        method: "PUT",
        body: JSON.stringify({
            post_id: postID
        }),
        headers: {"X-CSRFToken": csrftoken}
    })
    .then(async(response) => {
        // if success - update post's content
        if (response.status === 201) {
            console.log(`post id: ${postID} like count updated successfully`);
        }
        // if error - show alert and reload the page
        else {
            let response_body = await response.json();

            throw new Error(response_body.error);                        
        }
    })
    .catch(error => {
        alert(error);
        location.reload();
    })    

    // update counter in DOM
    likeCounter.innerHTML = newLikes;

    likedButton.remove()

    //replace likedbutton
    const likeButton = document.createElement('button');
    likeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
    <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"></path>
</svg>
Like`
    likeButton.classList.add('btn', 'btn-outline-primary', 'like-button');

    referenceNode = postWrapper.querySelector('.like-counter');
    postWrapper.insertBefore(likeButton, referenceNode);
}