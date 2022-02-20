const Applet = imports.ui.applet;
const Util = imports.misc.util;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Settings = imports.ui.settings;
const UUID = "sleeptimer@jd";

// pull: https://github.com/linuxmint/cinnamon-spices-applets

function SleepTimer(orientation, panel_height, instance_id) {
    this._init(orientation, panel_height, instance_id);
}

SleepTimer.prototype = {
    __proto__: Applet.TextIconApplet.prototype,

    _init: function(orientation, panel_height, instance_id) {
        Applet.TextIconApplet.prototype._init.call(this, orientation, panel_height, instance_id);

        this.set_applet_icon_name("Sleeptimer");
        this.set_applet_tooltip(_("Shows time until shutdown"));
        this.set_applet_label("SleepTimer");
        this.set = false;
		this.update_interval = 5000;

        try {

            this.settings = new Settings.AppletSettings(this, UUID, this.instance_id);
            this.settings.bindProperty(Settings.BindingDirection.IN, "update-interval", "update_interval", this._new_freq, null);

            this._get_status();
			this._update_loop();
		}
		catch (e) {
			global.logError(e);
		}

    },

    on_applet_removed_from_panel: function () {
		if (this._updateLoopID) {
			Mainloop.source_remove(this._updateLoopID);
		}

	},

    _run_cmd: function(command) {
      try {
        let [result, stdout, stderr] = GLib.spawn_command_line_sync(command);
        if (stdout != null) {
          return stdout.toString();
        }
      }
      catch (e) {
        global.logError(e);
      }

      return "";
    },

    _new_freq: function(){
    	global.log(this.update_interval);
        if (this._updateLoopID) {
			Mainloop.source_remove(this._updateLoopID);
		}
        this._update_loop();
    },

    _get_status: function(){
        //let status = this._run_cmd("head -1 /run/systemd/shutdown/scheduled");
        let status = this._run_cmd("echo poop");
        let outString;
        if (status != "poop"){
            this.set = true;
            outString = "ON";
        }else{
            this.set = false,
            outString = "asdf"
        }
        this.set_applet_label(outString);
    },

    _update_loop: function () {
		this._get_status();
		this._updateLoopID = Mainloop.timeout_add(this.update_interval, Lang.bind(this, this._update_loop));
	},

};


function main(metadata, orientation, panel_height, instance_id) {
    return new SleepTimer(orientation, panel_height, instance_id);
}
