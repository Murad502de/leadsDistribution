define(['jquery'], function ($) {
    var CustomWidget = function () {
        var self = this,
          system = self.system;
  
        this.get_ccard_info = function () //Сбор информации из карточки контакта
        {
            if (self.system().area == 'ccard') {
                var phones = $('.card-cf-table-main-entity .phone_wrapper input[type=text]:visible'),
                    emails = $('.card-cf-table-main-entity .email_wrapper input[type=text]:visible'),
                    name = $('.card-top-name input').val(),
                    data = [],
                    c_phones = [], c_emails = [];
                data.name = name;
                for (var i = 0; i < phones.length; i++) {
                    if ($(phones[i]).val().length > 0) {
                        c_phones[i] = $(phones[i]).val();
                    }
                }
                data['phones'] = c_phones;
                for (var i = 0; i < emails.length; i++) {
                    if ($(emails[i]).val().length > 0) {
                        c_emails[i] = $(emails[i]).val();
                    }
                }
                data['emails'] = c_emails;
                console.log(data)
                return data;
            } else {
                return false;
            }
        };
  
        this.sendInfo = function (person_name, settings) { // Отправка собранной информации
            self.crm_post(
                'https://www.hub.integrat.pro/Murad/leadsDistribution/server/app/redirect.php',
                {
                    // Передаем POST данные
                    name: person_name['name'],
                    phones: person_name['phones'],
                    emails: person_name['emails']
                },
                function (msg) {
                },
                'json'
            );
        };
        this.callbacks = {
            settings: function () {
            },
            dpSettings: function () {
            },
            init: function () {
                if (self.system().area == 'ccard') {
                    self.contacts = self.get_ccard_info();
                }
                return true;
            },
            bind_actions: function () {
                if (self.system().area == 'ccard' || 'clist') {
                    $('.ac-form-button').on('click', function () {
                        self.sendInfo(self.contacts);
                    });
                }
                return true;
            },
            render: function () {
                var lang = self.i18n('userLang');
                w_code = self.get_settings().widget_code; //в данном случае ='new-widget'
                if (typeof (AMOCRM.data.current_card) != 'undefined') {
                    if (AMOCRM.data.current_card.id == 0) {
                        return false;
                    } // не рендерить на contacts/add || leads/add 
                }
                self.render_template({
                    caption: {
                        class_name: 'js-ac-caption',
                        html: ''
                    },
                    body: '',
                    render: '\
       <div class="ac-form">\
           <div id="js-ac-sub-lists-container">\
           </div>\
           <div id="js-ac-sub-subs-container">\
           </div>\
           <div class="ac-form-button ac_sub">SEND</div>\
       </div>\
       <div class="ac-already-subs"></div>\
       <link type="text/css" rel="stylesheet" href="https://www.hub.integrat.pro/Murad/leadsDistribution/style.css" >'
                });
                return true;
            },
            contacts: {
                selected: function () {    //Здесь описано поведение при мультивыборе контактов и клике на название виджета
                    var c_data = self.list_selected().selected;
  
                    console.log( "selected data" );
                    console.log( c_data );
  
                    $('#js-sub-lists-container').children().remove(); //Контейнер очищается затем в контейнер собираются элементы, выделенные в списке.контейнер - div блок виджета, отображается в правой колонке.
                    var names = [], // Массив имен
                        length = c_data.length; // Количество выбранных id (отсчет начинается с 0)
                    for (var i = 0; i < length; i++) {
                        names[i] = {
                            emails: c_data[i].emails,
                            phones: c_data[i].phones
                        };
                    }
                    console.log(names);
                    for (var i = 0; i < length; i++) {
                        $('#js-ac-sub-lists-container').append('<p>Email:' + names[i].emails + ' Phone:' + names[i].phones + '</p>');
                    }
                    $(self.contacts).remove(); //очищаем переменную
                    self.contacts = names;
                }
            },
            leads: {
                selected: function () {
                  var l_data = self.list_selected().selected;
  
                  console.log( "selected data" );
                  console.log( l_data );
                }
            },
            onSave: function () {
  
                return true;
            }
        };
        return this;
    };
    return CustomWidget;
  });