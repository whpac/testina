<?php
use \UEngine\Modules\Pages\PageManager;
use \UEngine\Modules\Auth\AuthHandler;

PageManager::SetTitle('Logowanie');

$error_msg = '';
if(!is_null(AuthHandler::$last_result)){
    $result = AuthHandler::$last_result;
    if(!$result->IsSuccess()) $error_msg = 'Niepoprawny login lub hasło.';
}

$target = PageManager::GetRequestPathRaw();
if($target == '') $target = 'home';
?>
<form method="post" action="<?php echo($target); ?>">
    <div class="card login-form grid-form">
        <h2>Zaloguj się</h2>
        <input type="hidden" name="_handle_auth" value="login" />
        <label for="login">Login:</label>
        <input type="text" name="login" id="login" />
        <label for="password">Hasło:</label>
        <input type="password" name="password" id="password" />
        <button type="submit">Zaloguj</button>
        <span class="login-message"><?php echo($error_msg); ?></span>
    </div>
</form>