define([ 'jquery', 'underscore', 'twigjs', 'lib/components/base/modal' ], function ($, _, Twig, Modal) {
  let CustomWidget = function () {
    
    let self = this;

    this.name = "leadsDist";
    this.serverAddress = "https://hub.integrat.pro/Murad/" + this.name + "/public";

    this.modalMessage = {

      modalWindow: null,

      show: function ( data, warnung = false )
      {
          this.modalWindow = new Modal( {

              class_name: "modal-window",
              init: function ( $modal_body ) {
                  let $this = $( this );
                  $modal_body
                  .trigger( "modal:loaded" ) // запускает отображение модального окна
                  .html( data )
                  .trigger( "modal:centrify" ); // настраивает модальное окно
              },
              disable_escape_keydown: true,
              disable_overlay_click: true,
              destroy: function () {

                  console.debug( "close modal-destroy" );

                  return true;
              }

          } );

          if ( warnung ) // FIXME es gibt die Wiederholung
          $("#close_modal_dist").show(() => {
              $( "#close_modal_dist" ).on( "click" , () => {
              this.destroy();
              } );
          } );
          else
          $( "#close_modal_dist" ).hide();
      },

      showCloseButton: function () {
          $( "#close_modal_dist" ).show(() => {
              $( "#close_modal_dist" ).on( "click", () => {
                  this.destroy();
              } );
          } );
      },

      progress: function ( progress ) {
          $(".dist_progress_filter").css("width", progress + "%");
          $(".dist_progress_status-text").text(progress + "%");

          $(".dist_progress_bar").css("width", progress + "%");

          if ( progress == 100 )
          {
              $( "#close_modal_dist" ).show( () => {
                  $( "#close_modal_dist" ).on( "click", () => {
                      this.destroy();
                  });
              });
          }
      },

      destroy: function () {
          this.modalWindow.destroy();
      },

      setData: function ( data, warnung = false ){

          $( 'div.modal-body' ).html( data );

          if ( warnung ) // FIXME es gibt die Wiederholung
          {
              $( "#close_modal_dist" ).show( () => {
                  $( "#close_modal_dist" ).on( "click" , () => {
                      this.destroy();
                  } );
              } );
          }
          else
          {
              $( "#close_modal_dist" ).hide();
          }
      }
    };

    this.getUsersList_bind_actions = function ( method ) {

      let users = [];
      let usersList = null;

      switch ( method )
      {
        case "even":

          usersList = $( "input#leadsDist_user:checked" );

          for ( let i = 0; i < usersList.length; i++ )
          {
            users[ i ] = usersList[ i ].getAttribute( "data-id" );
          }

        break;

        case "percent":

          usersList = $( "input.percent_wert" );

          for ( let i = 0; i < usersList.length; i++ )
          {
              if ( Number( $( "input.percent_wert" )[ i ].value ) )
              {
                let user = {
                  id: usersList[ i ].getAttribute( "data-id" ),
                  percentage: Number( $( "input.percent_wert" )[ i ].value ),
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

    this.datenSenden = function ( _this, exportData ) {

        // Überprüfung, ob der Wert der Variable schon eingestelt ist
        if ( typeof _this.datenSenden.counter == "undefined" )
        {
          // Falls nein, wird die erstellt
          _this.datenSenden.counter = 1;
          _this.datenSenden.progress = 0;
          _this.datenSenden.steps = Math.ceil( exportData.leads.length / 50 );
        }

        if ( _this.datenSenden.counter == 1 )
        {
          console.debug( "open modal window" ); /* Debug */

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

          _this.modalMessage.show( data );
        }

        // Weitere normale Ausführung des Algorithmus

        console.debug( "counter:" ); // Debug
        console.debug( _this.datenSenden.counter ); // Debug

        let startIndex = ( _this.datenSenden.counter - 1 ) * 50;
        let endBorder = startIndex + 50 <= exportData.leads.length  ? startIndex + 50  : exportData.leads.length;

        /*
        console.debug( 'startIndex:' ); // Debug
        console.debug( startIndex ); // Debug

        console.debug( 'endBorder:' ); // Debug
        console.debug( endBorder ); // Debug
        */

        let exportDataPart = {
          users: exportData.users,
          leads: [],
          method: exportData.method,
          subdomain: exportData.subdomain
        };

        for ( let exportLeadIndex = startIndex; exportLeadIndex < endBorder; exportLeadIndex++ )
        {
          exportDataPart.leads.push( exportData.leads[ exportLeadIndex ] );
        }

        console.debug( "exportDataPart after:" );
        console.debug( exportDataPart );

        // Information an den Server senden
        $.ajax(
            {
              url: _this.serverAddress + "/api/distribution?subdomain=" + AMOCRM.widgets.system.subdomain, // куда отправляем запрос

              method: "post",

              dataType: "json",

              timeout: 3000000,

              data: {
                amoDaten: JSON.stringify( exportDataPart ), // POST-Daten senden
              },

              beforeSend: function (){},

              complete: function (){},

              error: function( jqXHR, textStatus, errorThrown  ) {

                console.debug( 'Ошибка времени исполнения виджета "Распределение ЛИДов"' );
                console.debug( jqXHR );
                console.debug( textStatus );
                console.debug( errorThrown );

                let data = `
                    <div class = "dist_warnung__wrapper">
                        <div class = "dist_warnung_logo__wrapper">
                            <img class = "dist_warnung__logo" src = "${_this.serverAddress}/widget/source/svg/error_red.svg">
                        </div>
                        <div class = "dist_warnung__container">
                            <h3 class = "dist_warnung__title">Произошла ошибка</h3>
                            <div class = "dist_warnung__message">
                                <p>
                                    Обратитесь, пожалуйста, в техническую поддержку <b>INTEGRAT</b><br>
                                    Контакные данные Вы сможете найти в меню настройки и подключения виджета в разделе <b>Интеграции</b><br>
                                    Подробности доступны в отладочной консоле браузера<br>
                                </p>
                            </div>
                            <button id = "close_modal_dist" class = "button-input js-modal-accept js-button-with-loader modal-body__actions__save js-progress-cont-to-work">
                                <span class = "dist_button-input-inner">
                                    <span class = "dist_button-input-inner_text">Продолжить работу</span>
                                </span>
                            </button>
                        </div>
                    </div>
                `;

                _this.modalMessage.setData( data, true );

              },

                success: function( Antwort, textStatus, xhr ) {
    
                    console.debug( "Serverantwort von app.php: " ); // Debug
                    console.debug( Antwort ); // Debug

                    switch ( xhr.status )
                    {
                        case 202:

                          console.debug( xhr ); // Debug

                          let data = `
                            <div class = "dist_warnung__wrapper">
                                <div class = "dist_warnung_logo__wrapper">
                                    <img class = "dist_warnung__logo" src = "${_this.serverAddress}/widget/source/svg/error_red.svg">
                                </div>
                                <div class = "dist_warnung__container">
                                    <h3 class = "dist_warnung__title">Произошла ошибка</h3>
                                    <div class = "dist_warnung__message">
                                        <p>
                                            Данное распределение с текущим фильтром не может быть выполнено, так как распределение с предыдущего сеанса еще не завершено.<br>
                                            Причинами данной проблемы могли послужить:<br>
                                            - Разрыв соединения (обновление страницы);<br>
                                            - Преднамеренный запуск распределения в другой вкладке того же самого аккаунта.<br><br>
                                            Рекомендуется повторить данную операцию по прошествии 5-10 минут, обновив предварительно страницу с текущим фильтром.
                                        </p>
                                    </div>
                                    <button id = "close_modal_dist" class = "button-input js-modal-accept js-button-with-loader modal-body__actions__save js-progress-cont-to-work">
                                        <span class = "dist_button-input-inner">
                                            <span class = "dist_button-input-inner_text">Продолжить работу</span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                          `;
                          
                          _this.modalMessage.setData( data, true );

                        break;
                    
                        default:

                          exportDataPart.leads = [];
      
                          if ( _this.datenSenden.counter < _this.datenSenden.steps )
                          {
                            _this.modalMessage.progress( Math.ceil( ( _this.datenSenden.counter / _this.datenSenden.steps ) * 100 ) );
            
                            _this.datenSenden.counter++;
            
                            _this.datenSenden( _this, exportData );
                          }
                          else
                          {
                            console.debug( "finish" ); // Debug
                            console.debug( "progress " + _this.datenSenden.progress ); // Debug
            
                            _this.modalMessage.progress( 100 );
            
                            delete _this.datenSenden.counter;
                            //_this.datenSenden.progress = 0;
            
                            return;
                          }

                        break;
                    }
                },
            }
        );
    }

    this.notice = function  ( header, text ) {

      console.debug( 'Mitteilung vom Widget' ); // Debug

      let errors = AMOCRM.notifications;
      let date_now = Math.ceil( Date.now() / 1000 );
      let n_data = {
          header: header, //код виджета
          text: '<div>' + text + '</div>', //текст уведомления об ошибке
          date: date_now //дата
      };

      let callbacks = {
          done: function () {
              console.debug( 'done' );
          }, //успешно добавлено и сохранено AJAX done
          fail: function () {
              console.debug( 'fail' );
          }, //AJAX fail
          always: function () {
              console.debug( 'always' );
          } //вызывается всегда
      };

      errors.add_error( n_data, callbacks );

    }

    this.callbacks = {

      render: function () {

        self.settings = self.get_settings();

        console.debug( self.name + " << render" ); // Debug
    
        if ( self.system().area == "llist" )
        {
          console.debug( self.name + " << render für llist" ); // Debug

          //let lang = self.i18n( "userLang" );
          let w_code = self.get_settings().widget_code; //в данном случае w_code='new-widget'

          console.debug( "w_code" ); // Debug
          console.debug( w_code ); // Debug

          if ( typeof AMOCRM.data.current_card != "undefined" )
          {
              if ( AMOCRM.data.current_card.id == 0 )
              {
                  // не рендерить на contacts/add || leads/add
                  return false;
              }
          }

          self.users = AMOCRM.constant( "managers" );
          self.usersList = "";
          self.usersListPercent = "";

          for ( let user in self.users )
          {
            if ( self.users[ user ][ "active" ] )
            {
            self.usersList += `
              <div class="leadsDist_currentUser_wrapper">
                <label class="od_control-checkbox">
                  <div class="od_control-checkbox__body">
                    <input id="leadsDist_user" class="leadsDist_user_input" type="checkbox" data-id="${user}">
                    <span class="leadsDist_headList__span od_control-checkbox__helper leadsDist_user_checkbox"></span>
                    <span class="leadsDist_user_name">${self.users[user]["title"]}</span>
                  </div>
                </label>
              </div>
            `;

            self.usersListPercent += '\
                <div class = "percent_user">\
                  <div data-id="' + user + '" class = "leadsDist_left">' + self.users[ user ][ "title" ] + '</div>\
                  <div data-id="' + user + '" class = "percent leadsDist_right">\
                    <span class = "per_zeichen">\
                      <img data-id="' + user + '" class = "per_zeichen__svg minus" src = "' + self.serverAddress + '/widget/source/svg/minus.svg" alt = "минус">\
                    </span>\
                    <input data-id="' + user + '" class = "percent_wert" type = "text" size = "1" value = "0">%\
                    <span class = "per_zeichen">\
                      <img data-id="' + user + '" class = "per_zeichen__svg plus" src = "' + self.serverAddress + '/widget/source/svg/plus.svg" alt = "плюс">\
                    </span>\
                  </div>\
                </div>';
            }
          }

          self.render_template(
            {
              caption: {
                  class_name: "js-ac-caption",
                  html: "",
              },
              body: "",
              render:
              '\
                  <div class="ac-form">\
                  <div id="js-ac-sub-lists-container">\
                      <p>Выберите метод распределения</p>\
                      <select id="leadsDist_method">\
                          <option value = "even">Равномерное распределение</option>\
                          <option value = "percent">Процентное соотношение</option>\
                      </select>\
                  </div>\
                  <div id="js-ac-sub-subs-container">\
                      ' + self.usersList + '\
                  </div>\
                  <div class="ac-form-button ac_sub">Выполнить распределение</div>\
                  </div>\
                  <div class="ac-already-subs"></div>\
                  <link type="text/css" rel="stylesheet" href="' + self.settings.path + '/style.css?v=' + self.settings.version + '">\
              '
            }
          );
        }

        if ( self.system().area == "advanced_settings" )
        {
          console.debug( self.name + " << render für advanced_settings" ); // Debug

          if ( $( 'link[href="' + self.settings.path + '/style.css?v=' + self.settings.version +'"' ).length < 1 )
          {
            //  Подключаем файл style.css передавая в качестве параметра версию виджета
            $( "head" ).append( '<link type="text/css" rel="stylesheet" href="' + self.settings.path + '/style.css?v=' + self.settings.version + '">' );
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

                            <label class="od_control-checkbox">
                              <div class="od_control-checkbox__body">
                                <input type="checkbox" class="od_headList od_checkbox lead_tasks__inner tasks_input">
                                <span class="leadsDist_headList__span od_control-checkbox__helper"></span>
                                <span class = "tasks_inner">Задачи</span>
                              </div>
                            </label>

                          </div>
                      </li>
                      <li class = "lead_contacts advanced_settings list">
                        <div>

                          <label class="od_control-checkbox">
                            <div class="od_control-checkbox__body">
                              <input type="checkbox" class="od_headList od_checkbox list_input lead_contacts_list_input">
                              <span class="leadsDist_headList__span od_control-checkbox__helper"></span>
                              <span class = "contacts_inner">Контакты</span>
                            </div>
                          </label>

                        </div>
                        <ul class = "contacts_entity advanced_settings" hidden>
                            <li class = "tasks lead_contacts_tasks">
                                <div>

                                  <label class="od_control-checkbox">
                                    <div class="od_control-checkbox__body">
                                      <input type="checkbox" class="od_headList od_checkbox lead_contacts_tasks__inner tasks_input">
                                      <span class="leadsDist_headList__span od_control-checkbox__helper"></span>
                                      <span>Задачи</span>
                                    </div>
                                  </label>

                                </div>
                            </li>
                            <li class = "companies advanced_settings list">
                              <div>

                                <label class="od_control-checkbox">
                                  <div class="od_control-checkbox__body">
                                    <input type="checkbox" class="od_headList od_checkbox list_input lead_contacts_companies_list_input">
                                    <span class="leadsDist_headList__span od_control-checkbox__helper"></span>
                                    <span>Компании</span>
                                  </div>
                                </label>

                              </div>
                              <ul class = "companies_entity advanced_settings" hidden>
                                  <li class = "tasks lead_contacts_companies_tasks">
                                      <div>

                                        <label class="od_control-checkbox">
                                          <div class="od_control-checkbox__body">
                                            <input type="checkbox" class="od_headList od_checkbox lead_contacts_companies_tasks__inner tasks_input">
                                            <span class="leadsDist_headList__span od_control-checkbox__helper"></span>
                                            <span>Задачи</span>
                                          </div>
                                        </label>

                                      </div>
                                  </li>
                              </ul>
                            </li>
                        </ul>
                      </li>
                      <li class = "lead_companies advanced_settings">
                        <div>

                          <label class="od_control-checkbox">
                            <div class="od_control-checkbox__body">
                              <input type="checkbox" class="od_headList od_checkbox list_input lead_companies_list_input">
                              <span class="leadsDist_headList__span od_control-checkbox__helper"></span>
                              <span class = "companies_inner">Компании</span>
                            </div>
                          </label>

                        </div>
                          <ul class = "companies_entity advanced_settings" hidden>
                              <li class = "tasks lead_companies_tasks">
                                <div>

                                  <label class="od_control-checkbox">
                                    <div class="od_control-checkbox__body">
                                      <input type="checkbox" class="od_headList od_checkbox lead_companies_tasks__inner tasks_input">
                                      <span class="leadsDist_headList__span od_control-checkbox__helper"></span>
                                      <span>Задачи</span>
                                    </div>
                                  </label>

                                </div>
                              </li>                
                          </ul>    
                      </li>
                  </ul>
                  </li>
              </ul>
              </div>
          `;

          let w_code = self.get_settings().widget_code;
  
          $( `div#work-area-${w_code}` ).append( advancedSettingsHtml );
        }

        return true;
      },

      init: function () {
        console.debug( self.name + " << init" );
        return true;
      },

      bind_actions: function () {

        console.debug( self.name + " << bind_actions" ); // Debug

        if ( self.system().area == "llist" )
        {
          console.debug( self.name + " << bind_actions für llist" ); // Debug

          // Verteilung starten
          $( ".ac-form-button" ).on( "click", function() {
  
              let exportData = {
                  users: [],
                  leads: [],
                  method: "",
                  subdomain: AMOCRM.widgets.system.subdomain,
              };
  
              if ( $( "select#leadsDist_method" ).val() === "even" )
              {
                /* der Teil gleichmäßiger Verteilung */

                console.debug( self.name + " << Выполнение распределения: even" ); // Debug
  
                // Information sammeln
                exportData.users = self.getUsersList_bind_actions( "even" );
                exportData.method = "even";
                exportData.leads = self.leadsList;
  
                console.debug( "exportData before:" ); // Debug
                console.debug( exportData ); // Debug
  
                if ( Number( exportData.users.length ) )
                {
                  console.debug( "gleichmäßige Verteilung kann ausgeführt werden" ); // Debug
  
                  let leads_newExportList = [];
  
                  for ( let leadIndex = 0, userIndex = 0; leadIndex < exportData.leads.length; leadIndex++, userIndex++ )
                  {
                    if ( userIndex >= exportData.users.length ) userIndex = 0;
    
                    let currentLead = {
                      id: exportData.leads[ leadIndex ].id,
                      newRespUserId: exportData.users[ userIndex ],
                    };
    
                    leads_newExportList.push( currentLead );
                  }
  
                  exportData.leads = leads_newExportList;
  
                  console.debug( "exportData after:" ); /* Debug */
                  console.debug( exportData ); /* Debug */
  
                  self.datenSenden( self, exportData ); // Information an den Server senden
                }
                else
                {
                  console.debug( "gleichmäßige Verteilung kann NICHT ausgeführt werden" ); // Debug
  
                  let data = `
                    <div class = "dist_warnung__wrapper">
                        <div class = "dist_warnung_logo__wrapper">
                            <img class = "dist_warnung__logo" src = "${self.serverAddress}/widget/source/svg/warnung_schild.svg">
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
  
                  self.modalMessage.show( data, true );
                  //modal.showCloseButton();
                }
              }
              else if ( $( "select#leadsDist_method" ).val() === "percent" )
              {
                /* Prozentverteilungsteil */

                console.debug( self.name + " << Выполнение распределения: percent" ); // Debug
    
                let ProzentSumme = 0;
                let ProzentInputs = $( "input.percent_wert" );
    
                for ( let prozentInputIndex = 0; prozentInputIndex < ProzentInputs.length; prozentInputIndex++ )
                {
                  ProzentSumme += Number( ProzentInputs[ prozentInputIndex ].value );
                }

                if ( Number( ProzentSumme ) === 100 )
                {
                  console.debug( "sum " + ProzentSumme ); // Debug
                  console.debug( "Verteilung kann ausgeführt werden" ); // Debug
  
                  // Information sammeln
                  exportData.users = self.getUsersList_bind_actions( "percent" );
                  exportData.method = "percent";
                  exportData.leads = self.leadsList;
  
                  console.debug( "exportData befor:" ); // Debug
                  console.debug( exportData ); // Debug
  
                  // exportierende Daten vorbereiten >>
                  let leads_newExportList = [];
  
                  let total = exportData.leads.length;
                  let rest = total;
                  let usersTarget = [];
  
                  for ( let userIndex = 0; userIndex < exportData.users.length && rest > 0; userIndex++ )
                  {
                    let currentUserPercentage = exportData.users[ userIndex ][ "percentage" ];
                    let numberOfLeads = ( total / 100 ) * currentUserPercentage;
                    let fractionalPart = ( numberOfLeads - Math.floor( numberOfLeads ) ) * 10;

                    if ( fractionalPart >= 5 )
                    {
                        if ( Math.ceil( numberOfLeads ) <= rest ) numberOfLeads = Math.ceil( numberOfLeads );
                        else numberOfLeads = Math.floor( numberOfLeads );
                    }
                    else
                    {
                      if ( userIndex == exportData.users.length - 1 ) numberOfLeads = rest;
                      else numberOfLeads = Math.floor( numberOfLeads );
                    }

                    rest -= numberOfLeads;
    
                    let userTarget = exportData.users[ userIndex ];
    
                    userTarget[ "numberOfLeads" ] = Number( numberOfLeads );
                    usersTarget.push( userTarget );
                  }
  
                  console.debug("usersTarget:"); // Debug
                  console.debug(usersTarget); // Debug
  
                  for ( let targetUserIndex = 0, leadIndex = 0; targetUserIndex < usersTarget.length; targetUserIndex++ )
                  {
                    for ( let numberOfLeadsIndex = 0; numberOfLeadsIndex < usersTarget[ targetUserIndex ][ "numberOfLeads" ]; numberOfLeadsIndex++, leadIndex++ )
                    {
                      let currentLead = {
                        id: exportData.leads[ leadIndex ].id,
                        newRespUserId: usersTarget[ targetUserIndex ][ "id" ],
                      };
  
                      leads_newExportList.push( currentLead );
                    }
                  }
  
                  exportData.leads = leads_newExportList;
  
                  // << exportierende Daten vorbereiten
  
                  console.debug( "exportData after:" ); /* Debug */
                  console.debug( exportData ); /* Debug */
  
                  self.datenSenden( self, exportData ); //
                }
                else
                {
                  console.debug( "sum " + ProzentSumme ); /* Debug */
                  console.debug( "Verteilung kann NICHT ausgeführt werden" ); /* Debug */
  
                  let data = `
                      <div class = "dist_warnung__wrapper">
                          <div class = "dist_warnung_logo__wrapper">
                              <img class = "dist_warnung__logo" src = "${self.serverAddress}/widget/source/svg/warnung_schild.svg">
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
    
                  self.modalMessage.show( data, true );
                  //modal.showCloseButton();
                }
              }
          });

            // Verteilung auswählen
            $( "select#leadsDist_method" ).on( "change", function( e ) {
    
                let leadsDistMethod = this.value;
    
                switch ( leadsDistMethod )
                {
                    case "even":
        
                      console.debug( "even" ); // Debug

                      $( "div#js-ac-sub-subs-container" ).children().remove();
                      $( "div#js-ac-sub-subs-container" ).append( self.usersList );

                    break;
    
                    case "percent":
        
                        console.debug( "percent" ); // Debug
        
                        let prozentRest = 100;
        
                        $( "div#js-ac-sub-subs-container" ).children().remove();
                        $( "div#js-ac-sub-subs-container" ).append( self.usersListPercent );
        
                        $( "img.plus" ).on( "click", ( event ) => {
        
                        let dataId = event.target.getAttribute( "data-id" );
                        let input = $( 'input[data-id="' + dataId + '"]' );
                        let value = Number( input[ 0 ].value );
        
                        if ( prozentRest > 0 )
                        {
                          prozentRest -= 5;
                          input[ 0 ].value = value + 5;
                        }
                        } );
        
                        $( "img.minus" ).on( "click", ( event ) => {

                          let dataId = event.target.getAttribute( "data-id" );
                          let input = $( 'input[data-id="' + dataId + '"]' );
                          let value = Number( input[ 0 ].value );
          
                          if ( value >= 5 )
                          {
                            prozentRest += 5;
                            input[ 0 ].value = value - 5;
                          }
                          else input[ 0 ].value = 0;

                        } );
        
                        // 0000000000000000000000000000
        
                        let oldValue = "";
        
                        $( "input.percent_wert" ).on( "focus", function () {
        
                          console.debug( "onfocus" ); // Debug
                          console.debug( $(this)[0].value ); // Debug
          
                          oldValue = $( this )[ 0 ].value;
                          console.debug( "oldValue " + oldValue ); // Debug
          
                          $( this )[ 0 ].value = "";
        
                        } );
        
                        $( "input.percent_wert" ).on( "blur", function () {
        
                          console.debug( "onblur" ); // Debug
                          console.debug( $( this )[ 0 ].value ); // Debug
          
                          if ( $( this )[ 0 ].value == "" )
                          {
                            $( this )[ 0 ].value = oldValue;
                          }
        
                        } );
        
                        $( "input.percent_wert" ).on( "input", function () {
        
                          console.debug( "input läuft" ); // Debug
                          console.debug( $( this ) ); // Debug
          
                          let regexpStr = /[A-Za-zА-Яа-яЁё.,\-_]/g;
          
                          $( this )[ 0 ].value = $( this )[ 0 ].value.replace( regexpStr, "" );
        
                        } );
        
                        // 0000000000000000000000000000
        
                    break;
    
                    default:
                      console.debug( "clear" ); // Debug
                    break;
                }
            });
        }
    
        if ( self.system().area == "advanced_settings" )
        {
          console.debug( self.name + " << bind_actions für advanced_settings" );

          $( ".tasks_input" ).change( function( event, trigger = { triggered: false } ) {
  
              if ( trigger.triggered )
              {
                console.debug( trigger ); /* Debug */
                console.debug( $(this)[0].checked ); /* Debug */
    
                $( this )[ 0 ].checked = !$( this )[ 0 ].checked;
    
                return;
              }
  
              $( ".advanced_settings__button_inner" ).addClass( "button-input_blue" );
              $( ".advanced_settings__button_inner" ).removeClass( "button-input-disabled" );
  
          });

          $( ".list_input" ).change( function( event, trigger = { triggered: false } ) {
  
            let listInput = $( this ).parent().parent().parent().parent()[ 0 ].querySelector( "ul" );

            listInput.hidden = !listInput.hidden;

            if ( trigger.triggered )
            {
              console.debug( trigger ); /* Debug */
              console.debug( $(this)[0].checked ); /* Debug */
  
              $( this )[ 0 ].checked = !$( this )[ 0 ].checked;
  
              return;
            }

            $( ".advanced_settings__button_inner" ).addClass( "button-input_blue" );
            $( ".advanced_settings__button_inner" ).removeClass( "button-input-disabled" );
  
          });

          // advanced_settings__button_inner
          // button-input-disabled
          // button-input_blue

            $(".advanced_settings__button").on( "click", ".button-input_blue", () => {
    
                console.debug( "Einstellungen senden" ); // Debug
    
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
    
                self.modalMessage.show( data );
    
                $( ".advanced_settings__button_inner" ).addClass( "button-input-disabled" );
                $( ".advanced_settings__button_inner" ).removeClass( "button-input_blue" );
    
                self.widgetSettings.tasks.value = $( ".lead_tasks__inner" )[ 0 ].checked;
    
                self.widgetSettings.contacts.value = $( ".lead_contacts_list_input" )[ 0 ].checked;
                self.widgetSettings.contacts.tasks.value = $( ".lead_contacts_tasks__inner" )[ 0 ].checked;
                self.widgetSettings.contacts.companies.value = $( ".lead_contacts_companies_list_input" )[ 0 ].checked;
                self.widgetSettings.contacts.companies.tasks.value = $( ".lead_contacts_companies_tasks__inner" )[ 0 ].checked;
    
                self.modalMessage.progress( 25 );
    
                self.widgetSettings.companies.value = $( ".lead_companies_list_input" )[ 0 ].checked;
                self.widgetSettings.companies.tasks.value = $( ".lead_companies_tasks__inner" )[ 0 ].checked;
    
                console.debug( self.widgetSettings );
    
                self.modalMessage.progress( 50 );
    
                $.post(

                  self.serverAddress + "/api/setSettings?subdomain=" + AMOCRM.widgets.system.subdomain,
  
                  {
                    settings: JSON.stringify( self.widgetSettings )
                  },
  
                  ( antwort ) => {
  
                    console.debug( "Serverantwort << " + antwort ); // Debug
    
                    self.modalMessage.progress( 100 );
                  },
  
                  "json"
                );
            } );
        }

        return true;
      },

      settings: function () {

        //console.debug( self.name + " << settings" ); // Debug

        if ( $( 'link[href="' + self.settings.path + '/style.css?v=' + self.settings.version +'"' ).length < 1 )
        {
          //  Подключаем файл style.css передавая в качестве параметра версию виджета
          $( "head" ).append( '<link type="text/css" rel="stylesheet" href="' + self.settings.path + '/style.css?v=' + self.settings.version + '">' );
        }

        /*==========================
        console.debug( this.widget.get_settings() );
        console.debug( 'Konstante: ' + this.widget.get_settings().Konstante );
        ============================*/

        document.querySelector( ".js-widget-save" ).textContent = "Активировать";

        //$( 'input[name="api_key"]' ).parent().parent().css('display', 'none');

        // Widget ausschalten
        $("div.widget-settings__command-plate").on( "click", "button.button-input.button-cancel.js-widget-uninstall", function() {

            console.debug( self.name + " << off" ); // Debug

            // FIXME get muss durch post ersetzt werden
            $.post(

                self.serverAddress + "/api/amoAuth/logout?subdomain=" + AMOCRM.widgets.system.subdomain,

                function ( Antwort )
                {
                    console.debug( Antwort ); // Debug
                },

                'json'

            );
        } );

        if ( self.params.status === "installed" )
        {
          $( 'input#leadsDist_privacyPolicy' )[ 0 ].checked = true;
        }

        // Widgetsautorisation
        if ( self.params.status === "not_configured" ) // FIXME anmelden nur nach der Speicherung die Benutzerdaten
        {
            /*==================================    
            $( 'input[name="Konstante"]' )[0].value = this.getRandomInt(1000000, 10000000);
            $( 'input[name="Konstante"]' ).trigger ( 'change' );    
            ==================================*/

            $('input[name="fio"]')[0].disabled = true;
            $('input[name="tel"]')[0].disabled = true;
            $('input[name="email"]')[0].disabled = true;

            $( 'input#leadsDist_privacyPolicy' ).change( function(){

                /*console.debug( 'change' );
                $( 'button.js-widget-save' ).addClass( 'button-input-disabled' );
                $( 'button.js-widget-save' ).removeClass( 'button-input_blue' );*/

                if ( $( this )[ 0 ].checked )
                {
                    console.debug( 'leadsDist_privacyPolicy ist aktiviert' ); // Debug

                    $('input[name="fio"]')[0].disabled = false;
                    $('input[name="tel"]')[0].disabled = false;
                    $('input[name="email"]')[0].disabled = false;
                }
                else
                {
                    console.debug( 'leadsDist_privacyPolicy ist deaktiviert' ); // Debug

                    $('input[name="fio"]')[0].disabled = true;
                    $('input[name="tel"]')[0].disabled = true;
                    $('input[name="email"]')[0].disabled = true;

                    $('input[name="fio"]')[0].value = '';
                    $('input[name="tel"]')[0].value = '';
                    $('input[name="email"]')[0].value = '';

                    $( 'input[name="fio"]' ).trigger ( 'change' );
                    $( 'input[name="tel"]' ).trigger ( 'change' );
                    $( 'input[name="email"]' ).trigger ( 'change' );

                    /*$( 'button.js-widget-save' ).addClass( 'button-input-disabled' );
                    $( 'button.js-widget-save' ).removeClass( 'button-input_blue' );*/
                }
                
            } );

            $( '.widget_settings_block__controls.widget_settings_block__controls_top' ).on( 'click', 'button.js-widget-save.button-input_blue', () => {

                if (    $('input[name="fio"]')[0].value == '' &&
                        $('input[name="tel"]')[0].value == '' &&
                        $('input[name="email"]')[0].value == ''
                    )
                {
                  //alert( 'Заполните поля' );
                }
                else
                {
                    let Ausfuhrdaten = {
                        users: AMOCRM.constant( "account" ).users,
                        subdomain: AMOCRM.widgets.system.subdomain,
                        //auth_code: this.widget.modal.options.widget.client.auth_code,
                        //secret_code: this.widget.modal.options.widget.client.secret,
                        client_id: self.modal.options.widget.client.uuid,
                        redirect_uri: self.modal.options.widget.client._links.redirect_uri.href,
                    };

                    console.debug( 'Dieses Benutzerkonto wird angemeldet' ); // Debug
                    console.debug( Ausfuhrdaten ); // Debug

                    $.post(

                        self.serverAddress + "/api/amoAuth/login?subdomain=" + AMOCRM.widgets.system.subdomain,

                        {
                            amoDaten: JSON.stringify( Ausfuhrdaten ), // POST-Daten senden
                        },

                        ( Antwort ) => {
                            console.debug( "success" ); // Debug
                            console.debug( Antwort ); // Debug

                            setTimeout(() => {
                                $.get( 

                                    self.serverAddress + "/api/redirect/clean/" + AMOCRM.widgets.system.subdomain,
                                    
                                    function( data )
                                    {
                                      console.debug( data );
                                    }, 
                                    
                                    'json'
                                );
                            }, 2000);
                        },

                        "json"

                    ).fail( ( Antwort ) => {
                            let noticeData  = '';

                            switch ( Antwort.status )
                            {
                                case 408:
                                    noticeData = `
                                        <h3>
                                            Ошибка при авторизации
                                        </h3>
                                        <p>
                                            Авторизационный код истёк.<br>
                                            Переподключите, пожалуйста, виджет.<br>
                                        </p>
                                    `;
                                    self.notice( 'Распределение ЛИДов', noticeData );
                                break;

                                case 404:
                                    noticeData = `
                                        <h3>
                                            Ошибка при авторизации
                                        </h3>
                                        <p>
                                            Авторизационный код не найден на серверной стороне виджета.<br>
                                            Переподключите, пожалуйста, виджет.<br>
                                        </p>
                                    `;
                                    self.notice( 'Распределение ЛИДов', noticeData );
                                break;
                            
                                default:
                                    noticeData = `
                                        <h3>
                                            Ошибка при авторизации
                                        </h3>
                                        <p>
                                            Неизвестная ошибка.<br>
                                            Код ошибки: ${Antwort.status}<br>
                                            Обратитесь, пожалуйста, в техническую поддержку разработчика.<br>
                                            Контактные данные Вы сможете найти в настройках виджета раздела "Интеграции".
                                        </p>
                                    `;
                                    self.notice( 'Распределение ЛИДов', noticeData );
                                break;
                            }
                    });
                }
            } );
        }

        return true;
      },

      onSave: function () {

        console.debug( self.name + " << onSave" ); // Debug
        return true;
      },

      destroy: function () {

        console.debug( self.name + " << destroy" ); // Debug

        $( 'link[href="' + self.settings.path + '/style.css?v=' + self.settings.version +'"' ).remove();

        return true;
      },

      contacts: {
        //select contacts in list and clicked on widget name
        selected: function () {
          console.debug( self.name + " << contacts:" ); // Debug
        }
      },
      
      leads: {
        //select leads in list and clicked on widget name
        selected: function () {
          console.debug( self.name + " << leads:" ); // Debug
    
          self.leadsList = self.list_selected().selected;
  
          console.debug( "selected data" ); // Debug
          console.debug( self.leadsList ); // Debug
        }
      },

      tasks: {
        //select taks in list and clicked on widget name
        selected: function () {
          //console.debug( self.name + " << tasks:" ); // Debug
        }
      },

      advancedSettings: function () {

        console.debug( self.name + " << advancedSettings" ); // Debug
    
        // man braucht vom Server aktuelle Einstellungen erhalten

        $.get(

            self.serverAddress + "/api/getSettings?subdomain=" + AMOCRM.widgets.system.subdomain,

            ( data, textStatus, xhr ) => {

                console.debug( xhr ); // Debug

                switch ( xhr.status )
                {
                    case 204:
                        self.widgetSettings = null;
                    break;
                
                    default:
                        self.widgetSettings = data;
                    break;
                }

                if ( self.widgetSettings )
                {
                  // TODO widget.widgetSettings prüfen, ob das null ist
    
                  console.debug( self.widgetSettings ); // Debug
          
                  if ( self.widgetSettings.tasks.value ) $( ".lead_tasks__inner" ).trigger( "change", { triggered: true } );
          
                  if ( self.widgetSettings.contacts.value ) $( ".lead_contacts_list_input" ).trigger( "change", { triggered: true } );
                  if ( self.widgetSettings.contacts.tasks.value ) $( ".lead_contacts_tasks__inner" ).trigger( "change", { triggered: true, } );
                  if ( self.widgetSettings.contacts.companies.value ) $( ".lead_contacts_companies_list_input" ).trigger( "change", { triggered: true, } );
                  if ( self.widgetSettings.contacts.companies.tasks.value ) $( ".lead_contacts_companies_tasks__inner" ).trigger( "change", { triggered: true, } );
          
                  if ( self.widgetSettings.companies.value ) $( ".lead_companies_list_input" ).trigger( "change", { triggered: true, } );
                  if ( self.widgetSettings.companies.tasks.value ) $( ".lead_companies_tasks__inner" ).trigger( "change", { triggered: true, } );
                }
                else
                {
                  // TODO eine Warnungsnachricht senden
                }
            },

            'json'
        );

        return true;
      },

      onSalesbotDesignerSave: function () {
        return true;
      },

    };

    return this;
  };

  return CustomWidget;
  
});