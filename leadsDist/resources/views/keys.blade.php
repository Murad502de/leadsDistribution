<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>

        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

        <style>
            .form-signin {
                width: 100%;
                max-width: 330px;
                padding: 15px;
                margin: auto;
            }

            body {
                display: flex;
                align-items: center;
                padding-top: 40px;
                padding-bottom: 40px;
                background-color: #f5f5f5;
            }

            html, body {
                height: 100%;
            }

            .sr-only, .sr-only-focusable:not(:focus) {
                position: absolute!important;
                width: 1px!important;
                height: 1px!important;
                padding: 0!important;
                margin: -1px!important;
                overflow: hidden!important;
                clip: rect(0,0,0,0)!important;
                white-space: nowrap!important;
                border: 0!important;
            }

            .font-weight-normal {
                font-weight: 400!important;
            }

            .form-signin input[type="email"] {
                margin-bottom: -1px;
                border-bottom-right-radius: 0;
                border-bottom-left-radius: 0;
            }

            .form-signin .form-control {
                position: relative;
                box-sizing: border-box;
                height: auto;
                padding: 10px;
                font-size: 16px;
            }

            .form-signin input[type="password"] {
                margin-bottom: 10px;
                border-top-left-radius: 0;
                border-top-right-radius: 0;
            }

            .form-signin .checkbox {
                font-weight: 400;
            }

            [type=button]:not(:disabled), [type=reset]:not(:disabled), [type=submit]:not(:disabled), button:not(:disabled) {
                cursor: pointer;
            }

            .btn-block {
                display: block;
                width: 100%;
            }

        </style>
    </head>
    <body class="text-center">

        <form class="form-signin" action="{{ route( 'keys' ) }}" method="post">
            <img class="mb-4" src="" alt="логотип bootstrap" width="72" height="72">
            <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
            <label for="inputEmail" class="sr-only">login</label>

            <?php
                if ( $_POST[ 'error' ] ) echo '<input name = "login" type="login" id="inputEmail" class="form-control" style="border: 1px solid red;" placeholder="login" required="" autofocus="">';
                else echo '<input name = "login" type="login" id="inputEmail" class="form-control" placeholder="login" required="" autofocus="">';
            ?>

            <label for="inputPassword" class="sr-only">password</label>

            <?php
                if ( $_POST[ 'error' ] ) echo '<input name = "password" type="password" id="inputPassword" class="form-control" style="border: 1px solid red;" placeholder="password" required="">';
                else echo '<input name = "password" type="password" id="inputPassword" class="form-control" placeholder="password" required="">';
            ?>
            <div class="checkbox mb-3">
                <label>
                <input name = "remember" type="checkbox" value="1"> Remember me
                </label>
            </div>
            <button class="btn btn-lg btn-outline-success btn-block" type="submit">sign in</button>
            <p class="mt-5 mb-3 text-muted">© 2021</p>
        </form>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    </body>
</html>