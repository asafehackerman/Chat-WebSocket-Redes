<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <title>Document</title>
</head>

<body>
    <x-container>
        <x-title>Bem-vindo ao Socket Web Chat!</x-title>
        <x-subtitle>Vamos conversar</x-subtitle>
        <x-label>Email</x-label>
        <x-email-input></x-email-input>
        <x-label>Senha</x-label>
        <x-password-input></x-password-input>
        <x-send-box>
            <x-submit-button>Entrar</x-submit-button>
            <x-submit-button>Cadastrar-se</x-submit-button>
        </x-send-box>
    </x-container>
</body>
</html>