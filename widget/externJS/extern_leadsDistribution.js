function extern_leadsDistribution()
{
    return class Extern
    {
        widget = null;
        name = null;
        serverAddress = null;
        modal = null;

        constructor( self )
        {
            this.widget = self;
            this.name = 'leadsDistribution';
            this.serverAddress = 'https://hub.integrat.pro/Murad/' + this.name + '/';

            /* Modal */
            this.modal = {
                modalWindow: null,

                show: function( Modal, data, warnung = false ){

                    this.modalWindow = new Modal( {
                        class_name: 'modal-window',
                        init: function ( $modal_body ) {
                            var $this = $( this );
                            $modal_body
                                .trigger( 'modal:loaded' ) // запускает отображение модального окна
                                .html( data )
                                .trigger( 'modal:centrify' )  // настраивает модальное окно
                        },
                        disable_escape_keydown: true,
                        disable_overlay_click: true,
                        destroy: function () {
                            console.log( 'close modal-destroy' );

                            return true;
                        }
                    } );

                    if ( warnung ) $( '#close_modal_dist' ).show( () => { $( '#close_modal_dist' ).on( 'click', () => { this.destroy(); } ); } );
                    else $( '#close_modal_dist' ).hide();
                },

                showCloseButton: function(){
                    $( '#close_modal_dist' ).show( () => {
                        $( '#close_modal_dist' ).on( 'click', () => { this.destroy(); } );
                    } );
                },

                progress: function( progress ){
                    $('.dist_progress_filter').css( 'width', progress + '%' );
                    $('.dist_progress_status-text').text( progress + '%' )

                    $('.dist_progress_bar').css( 'width', progress + '%' );

                    if ( progress == 100 )
                    {
                        $( '#close_modal_dist' ).show( () => {
                            $( '#close_modal_dist' ).on( 'click', () => { this.destroy(); } );
                        } );
                    }
                },

                destroy: function(){
                    this.modalWindow.destroy();
                }
            };
        }
        
        render()
        {
            console.log( this.name + ' << render' ); /* debug*/

            if ( this.widget.system().area == 'llist' )
            {
                console.log( this.name + ' << render für llist' ); /* debug*/

                let lang = this.widget.i18n( 'userLang' );
                let w_code = this.widget.get_settings().widget_code; //в данном случае w_code='new-widget'

                console.log( 'w_code' );
                console.log( w_code );

                if ( typeof ( AMOCRM.data.current_card ) != 'undefined' )
                {
                    if ( AMOCRM.data.current_card.id == 0 ) // не рендерить на contacts/add || leads/add
                    {
                        return false;
                    }
                }

                this.widget.users = AMOCRM.constant('managers');
                this.widget.usersList = ''; 
                this.widget.usersListPercent = '';

                for (let user in this.widget.users)
                {
                    if ( this.widget.users[user]['active'] )
                    {
                        this.widget.usersList += '<p><input id="leadsDist_user" type="checkbox" data-id="' + user + '"> ' + this.widget.users[user]['title'] + '</p>';

                        this.widget.usersListPercent += '\
                        <div class = "percent_user">\
                            <div data-id="' + user + '" class = "left">' + this.widget.users[user]['title'] + '</div>\
                            <div data-id="' + user + '" class = "percent right">\
                                <span class = "per_zeichen">\
                                    <img data-id="' + user + '" class = "per_zeichen__svg minus" src = "https://www.hub.integrat.pro/Murad/leadsDistribution/widget/source/svg/minus.svg" alt = "минус">\
                                </span>\
                                <input data-id="' + user + '" class = "percent_wert" type = "text" size = "1" value = "0">%\
                                <span class = "per_zeichen">\
                                    <img data-id="' + user + '" class = "per_zeichen__svg plus" src = "https://www.hub.integrat.pro/Murad/leadsDistribution/widget/source/svg/plus.svg" alt = "плюс">\
                                </span>\
                            </div>\
                        </div>';
                    }
                }

                //let settings = this.widget.get_settings();
                // <link type="text/css" rel="stylesheet" href="' + settings.path + '/style.css?">
                
                this.widget.render_template({
                    caption: {
                        class_name: 'js-ac-caption',
                        html: ''
                    },
                    body: '',
                    render: '\
                        <div class="ac-form">\
                            <div id="js-ac-sub-lists-container">\
                                <p>Выберите метод распределения</p>\
                                <select id="leadsDist_method">\
                                    <option value = "even">Равномерное распределение</option>\
                                    <option value = "percent">Процентное соотношение</option>\
                                </select>\
                            </div>\
                            <div id="js-ac-sub-subs-container">\
                            ' + this.widget.usersList + '\
                            </div>\
                            <div class="ac-form-button ac_sub">Выполнить распределение</div>\
                        </div>\
                        <div class="ac-already-subs"></div>\
                        <link type="text/css" rel="stylesheet" href="https://www.hub.integrat.pro/Murad/leadsDistribution/style.css">'
                });
            }

            if ( this.widget.system().area == 'advanced_settings' )
            {
                console.log( this.name + ' << render für advanced_settings' );

                if ( $( 'link[href="https://www.hub.integrat.pro/Murad/leadsDistribution/style.css"' ).length < 1 )
                {
                    //  Подключаем файл style.css передавая в качестве параметра версию виджета
                    $("head").append('<link href="https://www.hub.integrat.pro/Murad/leadsDistribution/style.css" type="text/css" rel="stylesheet">');
                }

                let advancedSettingsHtml = `
                    <div class = "advanced_settings_wrapper">

                        <div class = "advanced_settings__button">
                            <button class = "advanced_settings__button_inner button-input js-widget-save button-input-disabled">Сохранить</button>
                        </div>

                        <ul class = "lead_wrapper">

                            <li class = "lead advanced_settings">

                                <span class = "lead_inner">Сделка</span>

                                <ul class = "leads_entity advanced_settings">

                                    <li class = "tasks lead_tasks">
                                        <div>
                                            <input class = "lead_tasks__inner tasks_input" type = "checkbox"> <span class = "tasks_inner">Задачи</span>
                                        </div>
                                    </li>

                                    <li class = "lead_contacts advanced_settings list">

                                        <div>
                                            <input class = "list_input lead_contacts_list_input" type = "checkbox"> <span class = "contacts_inner">Контакты</span>
                                        </div>

                                        <ul class = "contacts_entity advanced_settings" hidden>

                                            <li class = "tasks lead_contacts_tasks">
                                                <div>
                                                    <input class = "lead_contacts_tasks__inner tasks_input" type = "checkbox"> <span>Задачи</span>
                                                </div>
                                            </li>

                                            <li class = "companies advanced_settings list">

                                                <div>
                                                    <input class = "list_input lead_contacts_companies_list_input" type = "checkbox"> <span>Компании</span>
                                                </div>

                                                <ul class = "companies_entity advanced_settings" hidden>
                                                    <li class = "tasks lead_contacts_companies_tasks">
                                                        <div>
                                                            <input class = "lead_contacts_companies_tasks__inner tasks_input" type = "checkbox"> <span>Задачи</span>
                                                        </div>
                                                    </li>
                                                </ul>

                                            </li>

                                        </ul>

                                    </li>

                                    <li class = "lead_companies advanced_settings">
                                        
                                        <div>
                                            <input class = "list_input lead_companies_list_input" type = "checkbox"> <span class = "companies_inner">Компании</span>
                                        </div>

                                        <ul class = "companies_entity advanced_settings" hidden>

                                            <li class = "tasks lead_companies_tasks">
                                                <div>
                                                    <input class = "lead_companies_tasks__inner tasks_input" type = "checkbox"> <span>Задачи</span>
                                                </div>
                                            </li>
                                            
                                        </ul>
                                        
                                    </li>

                                </ul>
                            </li>
                        </ul>
                    </div>
                `;

                let w_code = this.widget.get_settings().widget_code;

                $( `div#work-area-${w_code}` ).append( advancedSettingsHtml );
            }

            return true;
        }

        init()
        {
            console.log( this.name + ' << init' );

            let widget = this.widget;

            if ( ( this.widget.system().area == 'advanced_settings' ) || ( this.widget.system().area == 'llist' ) )
            {
                console.log( this.name + ' << init für advanced_settings & llist' );

                // man braucht vom Server aktuelle Einstellungen erhalten
                $.get( this.serverAddress + 'server/app/redirect.php?param=getSettings&subdomain=' + AMOCRM.widgets.system.subdomain, ( data ) => {

                    widget.widgetSettings = data;
                });
            }

            return true;
        }

        bind_actions( Modal )
        {
            
            console.log( this.name + ' << bind_actions' ); /* Debug */

            if ( this.widget.system().area == 'llist' )
            {
                console.log( this.name + ' << bind_actions für llist' ); /* Debug*/

                let widget = this.widget;
                let modal = this.modal;
                let serverAddress = this.serverAddress;
                let getUsersList_bind_actions = this.getUsersList_bind_actions;

                // Verteilung starten
                $( '.ac-form-button' ).on( 'click', function () {

                    let exportData = {
                        users: [],
                        leads: [],
                        method: '',
                        subdomain: AMOCRM.widgets.system.subdomain
                    };

                    if ( $('select#leadsDist_method').val() === 'even' ) /* der Teil gleichmäßiger Verteilung */
                    {
                        console.log( this.name + ' << Выполнение распределения: even' ); /* Debug */

                        // Information sammeln
                        exportData.users = getUsersList_bind_actions( 'even' );
                        exportData.method = 'even';
                        exportData.leads = widget.leadsList;

                        console.log( "exportData:" ); /* Debug */
                        console.log( exportData ); /* Debug */

                        if ( Number( exportData.users.length ) )
                        {
                            console.log( 'gleichmäßige Verteilung kann ausgeführt werden' ); /* Debug */

                            

                            // Information an den Server senden
                            $.ajax({
                                url: serverAddress + 'server/app/app.php', // куда отправляем запрос
                                method: 'post',
                                dataType: 'json',
                                data: {
                                    // POST-Daten senden
                                    amoData: exportData
                                },
                                beforeSend: function(){
                                    console.log( 'open modal window' );

                                    let data = `
                                        <h2>Выполняется распределение</h2>
                                        <div class = "dist_progress_inner">
                                            <div class = "dist_progress_status">
                                                <div class = "dist_progress_filter"></div>
                                                <span class = "dist_progress_status-text">0%</span>
                                            </div>
                                            <div class = "dist_progress_bar-wrapper">
                                                <div class = "dist_progress_bar"></div>
                                            </div>
                                            <div class = "dist_modal-body_actions">
                                                <button id = "close_modal_dist" class = "button-input js-modal-accept js-button-with-loader modal-body__actions__save js-progress-cont-to-work">
                                                    <span class = "dist_button-input-inner">
                                                        <span class = "dist_button-input-inner_text">Продолжить работу</span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    `;

                                    modal.show( Modal, data );

                                },
                                complete: function(){
                                    console.log( 'close modal window' );

                                    modal.progress( 100 );
                                },
                                error: function(x, t, e){
                                    if( t === 'timeout') {
                                        // Произошел тайм-аут
                                        console.log('timeout: ' + t);
                                    }
                                    else
                                    {
                                        console.log('Ошибка: ' + e);
                                        console.log('Ошибка t: ' + t);
                                    }
                                },
                                success: function( Antwort ){
                                    console.log( 'Serverantwort von app.php: ' + Antwort );
                                }
                            });

                            
                        }
                        else
                        {
                            console.log( 'gleichmäßige Verteilung kann NICHT ausgeführt werden' ); /* Debug */

                            let data = `
                                <div class = "dist_warnung__wrapper">
                                    <div class = "dist_warnung_logo__wrapper">
                                        <img class = "dist_warnung__logo" src = "https://www.hub.integrat.pro/Murad/leadsDistribution/widget/source/svg/warnung_schild.svg">
                                    </div>

                                    <div class = "dist_warnung__container">
                                        <h3 class = "dist_warnung__title">Распределение не может быть выполнено</h3>
                                        <div class = "dist_warnung__message">
                                            <p>Не выбран ни один пользователь</p>
                                        </div>
        
                                        <button id = "close_modal_dist" class = "button-input js-modal-accept js-button-with-loader modal-body__actions__save js-progress-cont-to-work">
                                            <span class = "dist_button-input-inner">
                                                <span class = "dist_button-input-inner_text">Продолжить работу</span>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            `;

                            modal.show( Modal, data, true );
                            //modal.showCloseButton();
                        }

                    }
                    else if ( $('select#leadsDist_method').val() === 'percent' ) /* Prozentverteilungsteil */
                    {

                        let ProzentSumme = 0;
                        let ProzentInputs = $('input.percent_wert');

                        for (let prozentInputIndex = 0; prozentInputIndex < ProzentInputs.length; prozentInputIndex++)
                        {
                            ProzentSumme += Number( ProzentInputs[ prozentInputIndex ].value );
                        }

                        if ( Number( ProzentSumme ) === 100 )
                        {
                            console.log('sum ' + ProzentSumme); /* Debug */
                            console.log( 'Verteilung kann ausgeführt werden' ); /* Debug */

                            /*

                            console.log( this.name + ' << Выполнение распределения: percent' );

                            // Information sammeln
                            exportData.users = getUsersList_bind_actions( 'percent' );
                            exportData.method = 'percent';
                            exportData.leads = widget.leadsList;

                            console.log( "exportData:" );
                            console.log( exportData );

                            // Information an den Server senden
                            $.ajax({
                                url: serverAddress + 'server/app/app.php', // куда отправляем запрос
                                method: 'post',
                                dataType: 'json',
                                data: {
                                    // POST-Daten senden
                                    amoData: exportData
                                },
                                beforeSend: function(){
                                    console.log( 'open modal window' );

                                    let data = `
                                        <h2>Выполняется распределение</h2>
                                        <div class = "dist_progress_inner">
                                            <div class = "dist_progress_status">
                                                <div class = "dist_progress_filter"></div>
                                                <span class = "dist_progress_status-text">0%</span>
                                            </div>
                                            <div class = "dist_progress_bar-wrapper">
                                                <div class = "dist_progress_bar"></div>
                                            </div>
                                            <div class = "dist_modal-body_actions">
                                                <button id = "close_modal_dist" class = "button-input js-modal-accept js-button-with-loader modal-body__actions__save js-progress-cont-to-work">
                                                    <span class = "dist_button-input-inner">
                                                        <span class = "dist_button-input-inner_text">Продолжить работу</span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    `;

                                    modal.show( Modal, data );

                                },
                                complete: function(){
                                    console.log( 'close modal window' );

                                    modal.progress( 100 );
                                },
                                error: function(x, t, e){
                                    if ( t === 'timeout') {
                                        // Произошел тайм-аут
                                        console.log('timeout: ' + t);
                                    }
                                    else
                                    {
                                        console.log('Ошибка: ' + e);
                                        console.log('Ошибка t: ' + t);
                                    }
                                },
                                success: function( Antwort ){
                                    console.log( 'Serverantwort von app.php: ' + Antwort );
                                }
                            });

                            */
                        }
                        else
                        {
                            console.log('sum ' + ProzentSumme); /* Debug */
                            console.log( 'Verteilung kann NICHT ausgeführt werden' ); /* Debug */

                            let data = `
                                <div class = "dist_warnung__wrapper">
                                    <div class = "dist_warnung_logo__wrapper">
                                        <img class = "dist_warnung__logo" src = "https://www.hub.integrat.pro/Murad/leadsDistribution/widget/source/svg/warnung_schild.svg">
                                    </div>

                                    <div class = "dist_warnung__container">
                                        <h3 class = "dist_warnung__title">Распределение не может быть выполнено</h3>
                                        <div class = "dist_warnung__message">
                                            <p>Процентная сумма должна быть всегда равна 100%</p>
                                        </div>
        
                                        <button id = "close_modal_dist" class = "button-input js-modal-accept js-button-with-loader modal-body__actions__save js-progress-cont-to-work">
                                            <span class = "dist_button-input-inner">
                                                <span class = "dist_button-input-inner_text">Продолжить работу</span>
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            `;

                            modal.show( Modal, data, true );
                            //modal.showCloseButton();
                        }
                    }
                });

                // Verteilung auswählen
                $( 'select#leadsDist_method' ).on('change', function ( e ) {
                    let leadsDistMethod = this.value;

                    switch ( leadsDistMethod )
                    {
                        case 'even':
                            console.log( 'even' );
                            $( 'div#js-ac-sub-subs-container' ).children().remove();
                            $( 'div#js-ac-sub-subs-container' ).append( widget.usersList );
                        break;
                        
                        case 'percent':
                            console.log( 'percent' );

                            let prozentRest = 100;

                            $( 'div#js-ac-sub-subs-container' ).children().remove();
                            $( 'div#js-ac-sub-subs-container' ).append( widget.usersListPercent );

                            $( 'img.plus' ).on( 'click', ( event ) => {

                                let dataId = event.target.getAttribute('data-id');
                                let input = $( 'input[data-id="' + dataId + '"]' );
                                let value = Number(input[0].value)
            
                                if ( prozentRest > 0 )
                                {
                                    prozentRest -= 5;
                                    input[0].value = value + 5
                                }
                            } );
            
                            $( 'img.minus' ).on( 'click', ( event ) => {
            
                                let dataId = event.target.getAttribute( 'data-id' );
                                let input = $( 'input[data-id="' + dataId + '"]' );
                                let value = Number( input[ 0 ].value );
                                
                                if ( value >= 5 )
                                {
                                    prozentRest += 5;
                                    input[ 0 ].value = value - 5;
                                }
                                else input[ 0 ].value = 0;
                            } );

                            /* 0000000000000000000000000000 */

                            let oldValue = '';

                            $('input.percent_wert').on('focus', function(){
                                console.log('onfocus'); /* Debug */
                                //console.log( $(this)[0].value ); /* Debug */
                                
                                oldValue = $(this)[0].value;
                                console.log( 'oldValue ' + oldValue ); /* Debug */
                            
                                $(this)[0].value = ''
                            });

                            $('input.percent_wert').on( 'blur', function(){
                                console.log('onblur'); /* Debug */
                                console.log( $(this)[0].value ); /* Debug */
                                
                                if ( $(this)[0].value == '' )
                                {
                                    $(this)[0].value = oldValue;
                                }

                            } );

                            $('input.percent_wert').on( 'input', function(){
                                console.log( 'input läuft' ); /* Debug */
                                console.log( $(this) ); /* Debug */

                            let regexpStr = /[A-Za-zА-Яа-яЁё.,\-_]/g;

                                $(this)[0].value = $(this)[0].value.replace( regexpStr, '' );
                            } );

                            /* 0000000000000000000000000000 */
                            
                        break;
                    
                        default:
                            console.log( 'clear' );
                        break;
                    }
                });
            }

            if ( this.widget.system().area == 'advanced_settings' )
            {
                console.log( this.name + ' << bind_actions für advanced_settings' );

                $('.tasks_input').change( function ( event, trigger = { triggered: false } ){

                    if ( trigger.triggered )
                    {
                        //console.log( trigger ); /* Debug */
                        //console.log( $(this)[0].checked ); /* Debug */

                        $( this )[ 0 ].checked = !$( this )[ 0 ].checked;

                        return;
                    }

                    $( '.advanced_settings__button_inner' ).addClass('button-input_blue');
                    $( '.advanced_settings__button_inner' ).removeClass('button-input-disabled');

                } );

                $( '.list_input' ).change( function ( event, trigger = { triggered: false } ){

                    let listInput = $(this).parent().parent()[0].querySelector( 'ul' );

                    listInput.hidden = !listInput.hidden;

                    if ( trigger.triggered )
                    {
                        //console.log( trigger ); /* Debug */
                        //console.log( $(this)[0].checked ); /* Debug */

                        $( this )[ 0 ].checked = !$( this )[ 0 ].checked;

                        return;
                    }

                    $( '.advanced_settings__button_inner' ).addClass('button-input_blue');
                    $( '.advanced_settings__button_inner' ).removeClass('button-input-disabled');
                });

                // advanced_settings__button_inner
                // button-input-disabled
                // button-input_blue

                $( '.advanced_settings__button' ).on( 'click', '.button-input_blue', () => {
                    console.log( 'Einstellungen senden' ); /* Debug */

                    let data = `
                        <h2>Сохранение настроек</h2>
                        <div class = "dist_progress_inner">
                            <div class = "dist_progress_status">
                                <div class = "dist_progress_filter"></div>
                                <span class = "dist_progress_status-text">0%</span>
                            </div>
                            <div class = "dist_progress_bar-wrapper">
                                <div class = "dist_progress_bar"></div>
                            </div>
                            <div class = "dist_modal-body_actions">
                                <button id = "close_modal_dist" class = "button-input js-modal-accept js-button-with-loader modal-body__actions__save js-progress-cont-to-work">
                                    <span class = "dist_button-input-inner">
                                        <span class = "dist_button-input-inner_text">Продолжить работу</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    `;

                    this.modal.show( Modal, data );

                    $( '.advanced_settings__button_inner' ).addClass( 'button-input-disabled' );
                    $( '.advanced_settings__button_inner' ).removeClass( 'button-input_blue' );

                    this.widget.widgetSettings.tasks.value = $( '.lead_tasks__inner' )[0].checked;

                    this.widget.widgetSettings.contacts.value = $( '.lead_contacts_list_input' )[0].checked;
                    this.widget.widgetSettings.contacts.tasks.value = $( '.lead_contacts_tasks__inner' )[0].checked;
                    this.widget.widgetSettings.contacts.companies.value = $( '.lead_contacts_companies_list_input' )[0].checked;
                    this.widget.widgetSettings.contacts.companies.tasks.value = $( '.lead_contacts_companies_tasks__inner' )[0].checked;

                    this.modal.progress( 25 );

                    this.widget.widgetSettings.companies.value = $( '.lead_companies_list_input' )[0].checked;
                    this.widget.widgetSettings.companies.tasks.value = $( '.lead_companies_tasks__inner' )[0].checked;

                    console.log( this.widget.widgetSettings );

                    this.modal.progress( 50 );

                    $.post( this.serverAddress + 'server/app/redirect.php?param=setSettings&subdomain=' + AMOCRM.widgets.system.subdomain, { settings: JSON.stringify( this.widget.widgetSettings ) }, ( antwort ) => {
                        
                        console.log( 'Serverantwort << ' + antwort ); /* Debug */
                        
                        this.modal.progress( 100 );

                    }, 'json' );

                } );
            }

            return true;
        }

        settings()
        {
            console.log( this.name + ' << settings' );

            let serverAddress = this.serverAddress;

            /*==========================

            console.log( this.widget.get_settings() );
            console.log( 'Konstante: ' + this.widget.get_settings().Konstante );

            ============================*/

            document.querySelector( ".js-widget-save" ).textContent = "Активировать";

            //$( 'input[name="api_key"]' ).parent().parent().css('display', 'none');

            // Widget ausschalten
            $('div.widget-settings__command-plate').on('click', 'button.button-input.button-cancel.js-widget-uninstall', function(){

                console.log( this.name + ' << off' );

                $.get( serverAddress + "server/app/redirect.php?param=destroy&subdomain=" + AMOCRM.widgets.system.subdomain, function( Antwort ){
                    console.log( Antwort );
                });

            });

            // Widgetsautorisation
            if ( this.widget.params.status === "not_configured" )
            {
                /*==================================
                
                $( 'input[name="Konstante"]' )[0].value = this.getRandomInt(1000000, 10000000);
                $( 'input[name="Konstante"]' ).trigger ( 'change' );
                
                ==================================*/

                let Ausfuhrdaten = {
                    users: AMOCRM.constant('account').users,
                    subdomain: AMOCRM.widgets.system.subdomain,
                    auth_code: this.widget.modal.options.widget.client.auth_code,
                    secret_code: this.widget.modal.options.widget.client.secret,
                    client_id: this.widget.modal.options.widget.client.uuid,
                    redirect_uri: this.widget.modal.options.widget.client._links.redirect_uri.href
                };

                console.log( Ausfuhrdaten );
    
                this.widget.crm_post(
    
                    this.serverAddress + 'server/app/auth.php',
    
                    {
                        // POST-Daten senden
                        amoDaten: Ausfuhrdaten
                    },
    
                    function( Antwort ){
                      console.log( 'Autorisationsantwort: ' + Antwort );
                    },
          
                    'json'
                );
            }

            return true;
        }

        advancedSettings()
        {
            console.log( this.name + ' << advancedSettings' );

            setTimeout( () => {
                console.log( this.widget.widgetSettings );

                let widgetSettings = this.widget.widgetSettings;

                if ( widgetSettings.tasks.value ) $( '.lead_tasks__inner' ).trigger( 'change', { triggered: true } );

                if ( widgetSettings.contacts.value ) $( '.lead_contacts_list_input' ).trigger( 'change', { triggered: true } );
                if ( widgetSettings.contacts.tasks.value ) $( '.lead_contacts_tasks__inner' ).trigger( 'change', { triggered: true } );
                if ( widgetSettings.contacts.companies.value ) $( '.lead_contacts_companies_list_input' ).trigger( 'change', { triggered: true } );
                if ( widgetSettings.contacts.companies.tasks.value ) $( '.lead_contacts_companies_tasks__inner' ).trigger( 'change', { triggered: true } );

                if ( widgetSettings.companies.value ) $( '.lead_companies_list_input' ).trigger( 'change', { triggered: true } );
                if ( widgetSettings.companies.tasks.value ) $( '.lead_companies_tasks__inner' ).trigger( 'change', { triggered: true } );

            }, 1000);

            return true;
        }

        destroy()
        {
            console.log( this.name + ' << destroy' );

            return true;
        }
        
        onSave()
        {
            console.log( this.name + ' << onSave' );

            return true;
        }

        contactsSelected()
        {
            console.log( this.name +  ' << contacts:' );
        }

        leadsSelected()
        {
            console.log( this.name +  ' << leads:' );

            this.widget.leadsList = this.widget.list_selected().selected;
  
            console.log( "selected data" );
            console.log( this.widget.leadsList );
        }

        tasksSelected()
        {
            console.log( this.name +  ' << tasks:' );
        }



        /*
        ===================================================================
       */

        getUsersList_bind_actions( method )
        {
            let users = [];
            let usersList = null;

            switch ( method )
            {

                case 'even':

                    usersList = $('input#leadsDist_user:checked');

                    for (let i = 0; i < usersList.length; i++)
                    {
                        users[i] = usersList[i].getAttribute('data-id');
                    }
                    
                break;

                case 'percent':

                    usersList = $('input.percent_wert');

                    for (let i = 0; i < usersList.length; i++)
                    {
                        if ( Number( $( 'input.percent_wert' )[ i ].value ) )
                        {
                            let user = {
                                id:  usersList[ i ].getAttribute( 'data-id' ),
                                percentage: Number( $( 'input.percent_wert' )[ i ].value )
                            };

                            users.push( user );
                        }
                    }
                    
                break;
            
                default:
                break;
            }

            return users;
        }
    }
}