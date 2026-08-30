// ===============================
// REGISTER
// ===============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful!");
                window.location.href = "login.html";
            } else {
                alert(data.message || "Registration failed");
            }

        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    });
}


// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful!");
                window.location.href = "dashboard.html";
            } else {
                alert(data.message || "Login failed");
            }

        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    });
}


// ===============================
// DASHBOARD
// ===============================

const blogContainer = document.getElementById("blogContainer");

if (blogContainer) {
    loadBlogs();
}

async function loadBlogs() {
    try {
        const response = await fetch("/api/blogs");
        const blogs = await response.json();

        blogContainer.innerHTML = "";

        blogs.forEach(blog => {
            const div = document.createElement("div");

            div.innerHTML = `
                <h3>${blog.title}</h3>
                <p>${blog.content}</p>
                <p>Author: ${blog.author}</p>
                <p>${new Date(blog.createdAt).toLocaleString()}</p>

                <button onclick="editBlog('${blog._id}')">Edit</button>
                <button onclick="deleteBlog('${blog._id}')">Delete</button>

                <hr>
            `;

            blogContainer.appendChild(div);
        });

    } catch (error) {
        console.error(error);
    }
}


// ===============================
// EDIT BLOG
// ===============================

function editBlog(id) {
    window.location.href = `create-blog.html?id=${id}`;
}


// ===============================
// DELETE BLOG
// ===============================

async function deleteBlog(id) {

    if (!confirm("Are you sure you want to delete this blog?")) {
        return;
    }

    try {
        const response = await fetch(`/api/blogs/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            alert("Blog deleted successfully");
            loadBlogs();
        } else {
            alert("Failed to delete blog");
        }

    } catch (error) {
        console.error(error);
        alert("Server error");
    }
}
// ===============================
// CREATE / EDIT BLOG
// ===============================

const blogForm = document.getElementById("blogForm");

if (blogForm) {

    const params = new URLSearchParams(window.location.search);
    const blogId = params.get("id");

    const titleInput = document.getElementById("title");
    const contentInput = document.getElementById("content");

    // EDIT MODE
    if (blogId) {

        document.querySelector("h1").textContent = "Edit Blog";
        document.querySelector("button[type='submit']").textContent = "Update Blog";

        fetch(`/api/blogs/${blogId}`)
            .then(response => response.json())
            .then(blog => {
                titleInput.value = blog.title;
                contentInput.value = blog.content;
            })
            .catch(error => {
                console.error(error);
                alert("Failed to load blog");
            });
    }

    // CREATE OR UPDATE
    blogForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const title = titleInput.value;
        const content = contentInput.value;

        try {

            let response;

            if (blogId) {

                // UPDATE
                response = await fetch(`/api/blogs/${blogId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        content
                    })
                });

            } else {

                // CREATE
                response = await fetch("/api/blogs", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        content,
                        author: "Anonymous"
                    })
                });
            }

            const data = await response.json();

            if (response.ok) {
                alert(blogId ? "Blog updated successfully!" : "Blog created successfully!");
                window.location.href = "dashboard.html";
            } else {
                alert(data.message || "Something went wrong");
            }

        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    });
}