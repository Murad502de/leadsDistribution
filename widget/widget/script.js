define(['jquery', 'underscore', 'twigjs', 'lib/components/base/modal', 'https://hub.integrat.pro/Murad/leadsDistribution/widget/externJS/extern_leadsDistribution.js'], function ($, _, Twig, Modal) {
  let CustomWidget = function () {

    console.log( 'leadsDistribution << start' );
    //console.log( Modal );
    
    let self = this;

    let ExternJS_leadsDist = extern_leadsDistribution();
    let Extern_leadsDist = new ExternJS_leadsDist( self );

    console.log( Extern_leadsDist ); // https://www.hub.integrat.pro/Murad/amocrmjstemplate/server/redirect.php

    this.callbacks = {
      render: function () {
        return Extern_leadsDist.render();
      },
      init: function () {
        return Extern_leadsDist.init();
      },
      bind_actions: function () {
        return Extern_leadsDist.bind_actions( Modal );
      },
      settings: function () {
        return Extern_leadsDist.settings();
      },
      onSave: function () {
        return Extern_leadsDist.onSave();
      },
      destroy: function () {
        return Extern_leadsDist.destroy();
      },
      contacts: {
        //select contacts in list and clicked on widget name
        selected: function () {
            Extern_leadsDist.contactsSelected();
        }
      },
      leads: {
        //select leads in list and clicked on widget name
        selected: function () {
            Extern_leadsDist.leadsSelected();
        }
      },
      tasks: {
        //select taks in list and clicked on widget name
        selected: function () {
            Extern_leadsDist.tasksSelected();
        }
      },
      advancedSettings: function () {
        console.log('advancedSettings');
        return true;
      },

      onSalesbotDesignerSave: function () {
        console.log('onSalesbotDesignerSave');
        return true;
      },
    };

    return this;
  };

  return CustomWidget;
});