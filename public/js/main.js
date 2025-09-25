document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const senha = document.getElementById('senha');
    const senhaConfirm = document.getElementById('senha_confirm');
    const email = document.getElementById('email');
    const emailConfirm = document.getElementById('email_confirm'); // Se você também quiser validar o email

    form.addEventListener('submit', function(event) {
        // Validação de Senhas
        if (senha.value !== senhaConfirm.value) {
            alert('A senha e a confirmação de senha não coincidem!');
            event.preventDefault(); // Impede o envio do formulário
            return;
        }

        // Se quiser validar E-mails também:
        if (email.value !== emailConfirm.value) {
            alert('O e-mail e a confirmação de e-mail não coincidem!');
            event.preventDefault(); // Impede o envio do formulário
            return;
        }
        
        // Se tudo estiver OK, o formulário será enviado para /cadastrar
    });
});