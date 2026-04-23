document.getElementById("F").addEventListener("submit",validar)
function validar(e){
    e.preventDefault();
    console.log("Validando credenciales...");
    let correo = document.getElementById("correo").value;
    let contraseña = document.getElementById("contraseña1").value;
    const correoAdmin = "admin@dominio.com";
    const contraseñaAdmin = "admin123";
    if(correo==""){
        alert ("por favor ingrese su correo")
    }else if(contraseña==""){
        alert("por favor ingrese su contrasena")
    }else if (correo === correoAdmin && contraseña === contraseñaAdmin){
        alert("¡Bienvenido, administrador!");
        window.location.href = "administrador.html";
    } else {
        alert("¡Bienvenido, usuario!");
        window.location.href = "pagina.html";
    }
}