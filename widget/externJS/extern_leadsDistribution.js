function extern_leadsDistribution()
{
    return class Extern
    {
        widget = null;
        name = null;
        serverAddress = null;

        constructor( self )
        {
            this.widget = self;
            this.name = 'leadsDistribution';
            this.serverAddress = 'https://hub.integrat.pro/Murad/' + this.name + '/';
        }
        
        render()
        {
            console.log( this.name + ' << render' );

            let lang = this.widget.i18n( 'userLang' );
            let w_code = this.widget.get_settings().widget_code; //в данном случае w_code='new-widget'

            if ( typeof ( AMOCRM.data.current_card ) != 'undefined' )
            {
                if ( AMOCRM.data.current_card.id == 0 ) // не рендерить на contacts/add || leads/add
                {
                    return false;
                }
            }

            this.widget.users = AMOCRM.constant('managers');
            this.widget.usersList = ''; 

            for (let user in this.widget.users)
            {
                if ( this.widget.users[user]['active'] )
                {
                    this.widget.usersList += '<p><input id="leadsDist_user" type="checkbox" data-id="' + user + '"> ' + this.widget.users[user]['title'] + '</p>';
                }
            }
            
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
                    <link type="text/css" rel="stylesheet" href="https://www.hub.integrat.pro/Murad/leadsDistribution/style.css" >'
            });

            return true;
        }

        init()
        {
            console.log( this.name + ' << init' );

            return true;
        }

        bind_actions( Modal )
        {
            console.log( this.name + ' << bind_actions' );

            if ( this.widget.system().area == 'ccard' || 'clist' )
            {
                let widget = this.widget;
                let serverAddress = this.serverAddress;
                let getUsersList_bind_actions = this.getUsersList_bind_actions;

                // Verteilung starten
                $( '.ac-form-button' ).on( 'click', function () {

                    let exportData = {
                        users: [],
                        leads: [],
                        method: ''
                    };

                    if ( $('select#leadsDist_method').val() === 'even' )
                    {
                        console.log( this.name + ' << Выполнение распределения: even' );

                        // Information sammeln
                        exportData.users = getUsersList_bind_actions();
                        exportData.method = 'even';
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

                                let data = '<p>Выполняется распределение</p>';

                                widget.modal = new Modal({
                                    class_name: 'modal-window',
                                    init: function ( $modal_body ) {
                                        var $this = $( this );
                                        $modal_body
                                            .trigger( 'modal:loaded' ) // запускает отображение модального окна
                                            .html( data )
                                            .trigger( 'modal:centrify' )  // настраивает модальное окно
                                    },
                                    //disable_escape_keydown: true,
                                    //disable_overlay_click: true,
                                    destroy: function () {
                                        console.log( 'close modal-destroy' );
    
                                        return true;
                                    }
                                });
                            },
                            complete: function()
                            {
                                console.log( 'close modal window' );
                                widget.modal.destroy();
                            },
                            error: function(x, t, e){
                                if( t === 'timeout') {
                                     // Произошел тайм-аут
                                     console.log('timeout: ' + t);
                                } else {
                                     console.log('Ошибка: ' + e);
                                     console.log('Ошибка t: ' + t);
                                }
                            },
                            success: function( Antwort ){
                                console.log( 'Serverantwort von app.php: ' + Antwort );
                            }
                        });


                        /*widget.crm_post(
    
                            serverAddress + 'server/app/app.php',
            
                            {
                                // POST-Daten senden
                                amoData: exportData
                            },
            
                            function( Antwort ){
                              console.log( 'Serverantwort von app.php: ' + Antwort );
                            },
                  
                            'json'
                        );*/
                    }
                    else if ( $('select#leadsDist_method').val() === 'percent' )
                    {
                        console.log( this.name + ' << Выполнение распределения: percent' );
                    }
                });

                // Verteilung auswählen
                $( 'select#leadsDist_method' ).on('change', function ( e ) {
                    let leadsDistMethod = this.value;

                    switch ( leadsDistMethod )
                    {
                        case 'even':
                            console.log( 'even' );
                            $( 'div#js-ac-sub-subs-container' ).append( widget.usersList );
                        break;
                        
                        case 'percent':
                            console.log( 'percent' );
                            $( 'div#js-ac-sub-subs-container' ).children().remove();
                        break;
                    
                        default:
                            console.log( 'clear' );
                        break;
                    }
                });
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

                $.get( serverAddress + "server/app/redirect.php?param=destroy", function( Antwort ){
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

        getUsersList_bind_actions()
        {
            let usersList = $('input#leadsDist_user:checked');
            let users = [];

            for (let i = 0; i < usersList.length; i++)
            {
                users[i] = usersList[i].getAttribute('data-id');
            }

            return users;
        }
    }
}