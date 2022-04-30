# smartthings-google-nest-sdm

A SmartThings plugin for Google Nest devices that uses the [Google Smart Device Management API](https://developers.google.com/nest/device-access). Supports Cameras, Doorbells, Displays, and Thermostats.

**THIS PLUGIN IS NOT FINISHED. COME BACK LATER.**

**Please read the [FAQ](https://github.com/aokerholm/smartthings-google-nest-sdm#faq) before creating an issue.**

# Disclaimer

This package is not provided, endorsed, affiliated with, or supported by Google in any way.  It is intended for personal, non-commercial use only.  Please review the [Google Smart Device Management Terms of Service](https://developers.google.com/nest/device-access/tos) to ensure that your usage of this package is not in violation.

# Installation

WIP

# Where do the config values come from?

Follow the getting started guide here: https://developers.google.com/nest/device-access/get-started  Please mind the "ONE IMPORTANT DIFFERENCE" section below.

**clientId** and **clientSecret** come from this step: https://developers.google.com/nest/device-access/get-started#set_up_google_cloud_platform.  **clientId** should look something like "780816631155-gbvyo1o7r2pn95qc4ei9d61io4uh48hl.apps.googleusercontent.com". **clientSecret** will be a random string of letters, numbers, and dashes.

**projectId** comes from this step: https://developers.google.com/nest/device-access/get-started#create_a_device_access_project

**refreshToken** comes from this step: https://developers.google.com/nest/device-access/authorize#get_an_access_token

**subscriptionID** comes from this step: https://developers.google.com/nest/device-access/subscribe-to-events#create_a_pull_subscription. It should look like "projects/your-gcp-project-id/subscriptions/your-subscription-id".

**gcpProjectId** is optional. It is the ID of the Google Cloud Platform project you created when getting the **clientId** and **clientSecret**. If you are having trouble subsribing to events try populating this field.

**vEncoder** is optional.  It is the encoder the plugin will use for camera streams. If vEncoder is not specified it will default to "libx264 -preset ultrafast -tune zerolatency". On a Raspberry Pi 4 you can try something like "h264_v4l2m2m". On other platforms you are free to use the encoder of your choice.  If you don't know what this means you can probably ignore it.

ONE IMPORTANT DIFFERENCE!

In step two "Authorize an Account" in the "Link your account" section, step 1, you are instructed to "open the following link in a web browser":

https://nestservices.google.com/partnerconnections/project-id/auth?redirect_uri=https://www.google.com&access_type=offline&prompt=consent&client_id=oauth2-client-id&response_type=code&scope=https://www.googleapis.com/auth/sdm.service

DO NOT USE THIS URL!

You should instead use this URL:

https://nestservices.google.com/partnerconnections/project-id/auth?redirect_uri=https://www.google.com&access_type=offline&prompt=consent&client_id=oauth2-client-id&response_type=code&scope=https://www.googleapis.com/auth/sdm.service+https://www.googleapis.com/auth/pubsub

Note the "+https://www.googleapis.com/auth/pubsub" on the end.  This is so you will have access to events.




# Hardware Requirements

The minimum hardware requirement is something like a Raspberry Pi 4.  If you want multiple people viewing the camera streams at once then you'll probably need even more power.

I tried very hard to avoid having to transcode the video, which would allow the plugin to run on something like a pi-zero.  Unfortunately this is simply not possible, the Apple Home App will not properly display the native stream.  In most cases the frame rate will be off, or it will fail to show at all (the iPhone will not show any video higher than 1080p, the Nest Doorbell produces video at a higher resolution).

# FAQ

**Q**: I don't see camera snapshots in the Home app, just the Nest/Google logo. Why?

**A**: The SDM API does not have any method for getting a camera snapshot on demand, only when an event occurs. The Nest logo is used as a placeholder for first generation cameras, while the Google logo is used for second generation cameras.  If an event occurred in the last few seconds you will likely see an image.

**Q**: My cameras never respond.  Why?

**A**: There are a couple possible reasons for this:

1. Is the microphone/audio disabled on your camera?  If so you will need to enable it.
2. Do you see something like `[homebridge-google-nest-sdm] Failed to start stream: spawn ffmpeg ENOENT` in your logs? The plugin requires ffmpeg and tries to auto-install it, but if it can't, you'll have to install it manually. For Windows go [here](https://www.ffmpeg.org/download.html). If you have a Mac, especially an Apple Silicon Mac, you should probably use [brew](https://formulae.brew.sh/formula/ffmpeg). On Linux use the package manager of your choice. 
3. Is your Apple device connected to a VPN? If so, disconnect.
4. Wait a while, occasionally the API will refuse all requests for short periods.

**Q**: My cameras only respond some of the time. Why?

**A**: Much like the behaviour some of us have experienced in the Nest app, sometimes the API errors out for unknown reasons.  See also this [issue](https://github.com/potmat/homebridge-google-nest-sdm/issues/4).  I am doing my best to find out why the API fails so often.

**Q**: My cameras stream stops responding after five minutes. Why?

**A**: Streams on the battery powered cameras only last five minutes.  On the wired cameras it's in theory possible to view the stream for more than five minutes, but I haven't figured out how to make that work yet.

**Q**: When the plugin starts I get some message about ```Plugin initialization failed, there was a failure with event subscription```.  Why?

**A**: As the error message tells you, make sure you mind the ["ONE IMPORTANT DIFFERENCE"](https://github.com/potmat/homebridge-google-nest-sdm#where-do-the-config-values-come-from) when setting up your config values.  Try using the **gcpProjectId** config value if you continue to have problems.

**Q**: My camera shows up as ```<null> Camera``` or ``` Camera``` without the room name or anything.  Why?

**A**: This is actually a glitch on the Google side, see [this comment](https://github.com/potmat/homebridge-google-nest-sdm/issues/6#issuecomment-978088908).

**Q**: I'm having problems getting through the getting started guide and getting the config values. Can you help?

**A**: Probably not.  Having a day job and family I don't have much time to help with this.  The Nest plugin for Home Assistant uses much the same process (don't forget the ["ONE IMPORTANT DIFFERENCE"](https://github.com/potmat/homebridge-google-nest-sdm#where-do-the-config-values-come-from) section above).  It has an [illustrated guide](https://www.home-assistant.io/integrations/nest/) that you may find helpful. You can also try reaching out to others on [Discord](https://discord.gg/kqNCe2D) or [Reddit](https://www.reddit.com/r/homebridge/), some people there may be able to help.

**Q**: Do I really have to pay $5 to use the API?

**A**: Yup.

Q: I just added a Nest device to my account, but it's not showing up in Home. Why?

A: You need to visit the ["ONE IMPORTANT DIFFERENCE"](https://github.com/potmat/homebridge-google-nest-sdm#where-do-the-config-values-come-from) URL again.  Here you will choose which Nest devices to authorize, you should see your new device here.  After you finish the process and get a new refresh token restart Homebridge, your device should now be visible.


