document.addEventListener("DOMContentLoaded", function () {

    // CREATE BLOG
    const blogForm = document.getElementById("blogForm");

    if (blogForm) {
        blogForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const title = document.getElementById("title").value;
            const content = document.getElementById("content").value;

            const blogs = JSON.parse(localStorage.getItem("blogs")) || [];

            blogs.push({
                title: title,
                content: content,
                date: new Date().toLocaleString()
            });

            localStorage.setItem("blogs", JSON.stringify(blogs));

            alert("Blog published successfully!");

            window.location.href = "dashboard.html";
        });
    }

    // DISPLAY BLOGS ON DASHBOARD
    const blogContainer = document.getElementById("blogContainer");

    if (blogContainer) {
        const blogs = JSON.parse(localStorage.getItem("blogs")) || [];

        if (blogs.length === 0) {
            blogContainer.innerHTML = "<p>No blogs published yet.</p>";
        } else {
            blogs.forEach(function (blog) {
                const blogDiv = document.createElement("div");

                blogDiv.innerHTML = `
                    <h3>${blog.title}</h3>
                    <p>${blog.content}</p>
                    <small>${blog.date}</small>
                    <hr>
                `;

                blogContainer.appendChild(blogDiv);
            });
        }
    }
});
// REGISTER USER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);

        alert("Registration successful!");

        window.location.href = "login.html";
    });
}

// LOGIN USER
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const savedEmail = localStorage.getItem("userEmail");
        const savedPassword = localStorage.getItem("userPassword");

        if (email === savedEmail && password === savedPassword) {
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid email or password");
        }
    });
}
// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
    window.location.href = "login.html";
});
}
function logout() {
    window.location.href = "login.html";
}
// CREATE BLOG
const blogForm = document.getElementById("blogForm");

if (blogForm) {
    blogForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;

        try {
            const response = await fetch("http://localhost:5000/api/blogs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    content: content
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Blog published successfully!");
                window.location.href = "dashboard.html";
            } else {
                alert(data.message || "Failed to publish blog");
            }

        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    });
}

