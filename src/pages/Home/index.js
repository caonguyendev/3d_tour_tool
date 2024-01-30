import React, { useState } from "react";
import Container from "../../common/Container";
import styled from "styled-components";
import { DownloadOutlined } from "@ant-design/icons";
import { Input, InputNumber, Radio, Button, Checkbox } from "antd";
import XMLParser from "react-xml-parser";

const { TextArea } = Input;

const GroupFrom = styled.div`
  padding-top: 10px;
`;
const GroupFromLabel = styled.div`
  font-weight: bold;
  font-size: 1.2em;
`;
const FromLable = styled.div`
  font-weight: bold;
  font-size: 1em;
  padding: 10px 0px;
`;
const FromItem = styled.div`
  font-size: 1em;
  padding: 10px 0px;
`;

const hotSpotStyleName = "hotspotvtour4";

const checkKey = (key, obj) => {
  // Check if the key exists in the object and the value is not null
  if (key in obj && obj[key] !== null) {
    // Check if the value is a number
    if (typeof obj[key] === "number") {
      return true;
    }
  }
  return false;
};

const krpanoTemplate = (
  styles,
  hotspots,
  scenes,
  dollhouses,
  condition
) => `<krpano version="1.21" title="Virtual Tour" onstart="onLoadedXML();">
<include url="plugins/config.xml" />
<include url="plugins/contextmenu.xml" />
<include url="plugins/showtext.xml" />
<include url="plugins/preload.xml" />
<include url="plugins/webvr.xml" />
<include url="plugins/tag.xml" />
${
  condition.floorplan2DFeature
    ? `<include url="FloorPlan/xml/floorplan_SM.xml" />`
    : ``
}
<!-- <include url="%SWFPATH%/add_hotspot/plugins_l/add_hotspot.xml" />  -->
<!-- <include url="%SWFPATH%/add_hotspot/plugins_l/editor/add_hotspot_2.xml" />  -->
<include url="%SWFPATH%/add_hotspot/plugins_l/plugin_a/actiontHS.xml" /> 
<include url="%SWFPATH%/add_hotspot/plugins_l/plugin_a/photo.xml" /> 
<include url="%SWFPATH%/add_hotspot/plugins_l/plugin_a/poligon.xml" /> 
<include url="%SWFPATH%/add_hotspot/plugins_l/plugin_a/sound_hs.xml" /> 
<include url="%SWFPATH%/add_hotspot/plugins_l/plugin_a/style_addhs.xml" /> 
<include url="%SWFPATH%/add_hotspot/plugins_l/plugin_a/vid_hs.xml" /> 
<include url="%SWFPATH%/add_hotspot/plugins_l/plugin_a/video.xml" /> 
<include url="%SWFPATH%/add_hotspot/plugins_l/plugin_a/youtube.xml" /> 
<include url="plugins/depthmap_measure3d.xml" />
<include url="plugins/depthmap_navigation.xml"/>
<include url="toolbox/stickie_data.xml" />

${
  condition.musicFeature
    ? `<!-- load the soundinterface plugin -->
<plugin name="soundinterface"
  url="js/soundinterface.js"
  rootpath=""
  preload="true"
  keep="true"
/>`
    : ``
}

<plugin name="toolbox" url="toolbox/toolboxV2.js" keep="true" preload="true"
  poly_bgcolor="0x336699"
  dot_color="0xffff00"
  dot_size="12"
  active_dot_color="0x00ff00"
  active_dot_size="12"

  keycode_to_home="77"
  keycode_to_activate="84"
  keycode_to_log="76"
  keycode_to_numbers="78"
  keycode_to_distorted="72"
  keycode_to_poly="80"
  keycode_to_grid="71"
  keycode_to_stickies="74"
  keycode_to_colorpicker="75"
  keycode_to_info="73"

  decimals_for_numbers="3"
  decimals_for_dhe="2"

  basecolor_for_colorpicker="0xff0000"
/>

<action name="onLoadedXML" type="Javascript"><![CDATA[
  krpano.prevscene = 'scene_pano4';
  krpano.call("transition_to_dh()");
  scenePanoCount();
  updateHotspotListPositionAndHotspotListOnFloor();
  showHotspotsInCurrentScene(false);
  ${
    condition.musicFeature
      ? `krpano.call("playsound('bgmusic', './audio/background_music.mp3', true)");`
      : ``
  }
]]></action>

<events name="local_event" keep="true" onclick="js(localEventOnClick());" ${
  condition.autotourFeature ? `onautorotateoneround="js(nextScene());"` : ``
}/>

<style name="hotspotvtour4" type="image" url="images/hotspot.svg" capture="false" width="18.5" height="18.5" keep="true" visible="true" distorted="true" depth="0" depthbuffer="true" rotationorder="xzy" rx="90" ty="0" alpha="0.25" onover.addevent="tween(alpha, 1 ,0.2); js(showCursorHotspot(false));" onout.addevent="tween(alpha, 0.4 ,0.2); js(showCursorHotspot());"/>
<style name="hotspot_dollhouse_and_floorplan" type="image" url="images/hotspot.svg" capture="false" width="18.5" height="18.5" visible="true" distorted="true" depth="0" depthbuffer="true" rotationorder="xzy" rx="90" ty="0" alpha="0.25" onover.addevent="tween(alpha, 1 ,0.2); js(showCursorHotspot(false));" onout.addevent="tween(alpha, 0.4 ,0.2); js(showCursorHotspot());"/>
<style name="Style_dollhouse" prealign="0|0|0" ox="0" oy="0" oz="0" />
<style name="Style_floorplan" prealign="0|0|0" ox="0" oy="0" oz="0"/>${styles}

<!-- hotspots  -->
${hotspots}

<!-- scene pano  -->
${scenes}
<!-- Action  -->
${dollhouses}

</krpano>`;

const scenePanoTemplate = (pano_id, origin, align) => {
  return `\n<scene name="scene_pano${pano_id}" title="pano${pano_id}" onstart="" thumburl="panos/pano${pano_id}.tiles/thumb.jpg" lat="" lng="" alt="" heading="">

 <control bouncinglimits="calc:image.cube ? true : false" />

 <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" limitview="auto" />

 <preview url="panos/pano${pano_id}.tiles/preview.jpg" />

 <image style="style_pano${pano_id}">
    <cube url="panos/pano${pano_id}.tiles/pano_%s.jpg" />
    <depthmap url="model/model.depth"
    enabled="true"
    rendermode="3dmodel"
    background="none"
    scale="100"
    offset="0.0"
    subdiv=""
    encoding="gray"
    axis="+x+y+z"
    cull="front"
    hittest="true"
    origin="${origin}"
    align="0|${align.split("|")[1]}|0"
 />
 </image>
</scene>
`;
};

const sceneDollhouseOrFloorTemplate = (
  isDollhouseScene,
  textureFileName = "",
  hotspots = "",
  scene = {
    name: "dollhouse",
    title: "Dollhouse",
    style: "Style_dollhouse",
    sphereURL: `dollhouse/${textureFileName}`,
    depthmapURL: "dollhouse/dollhouse.obj",
    texURL: "dollhouse/dollhouse.mtl",
  }
) => `
  ${
    isDollhouseScene ? "<!-- Dollhouse Scene -->" : "<!--  Floorplan Scene  -->"
  }
<scene name="${scene.name}" title="${
  scene.title
}" onstart="" lat="" lng="" heading="" css="z-index: 9999;">
 <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" limitview="auto" />
 <image style="${scene.style}">
  <sphere url="${scene.sphereURL}" />
  <depthmap url="${scene.depthmapURL}" texurl="${
  scene.texURL
}" backgroundurl="images/black.svg" enabled="true" rendermode="3dmodel" textured="true" background="none" scale="100" offset="0" subdiv="" encoding="gray" cull="front" hittest="true" />
 </image> ${hotspots}
</scene>
`;

const hotSpotTemplate = ({ name, style, tx, ty, tz, distance }) => {
  return `<hotspot name="${name}" style="${style}" tx="${tx}" ty="${(
    parseFloat(ty) - distance
  ).toFixed(2)}" tz="${tz}" rx="-90.0" ry="-0.0" rz="0.0" />\n`;
};

// Dollhouse and Floorplan Action
const commonActionTransitionForDollhouseAndFloorplan = () => `
<!--  Transition to dollhouse   -->
<action name="transition_to_dh">
  <!--call when access the page in the first time  -->
  if(!isvalue(xml.scene),
    tween(view.hlookat|view.vlookat, 0|30, 1.0, easeinoutquad);
  );
  set(view.fovmax, 135);
  adjusthlookat(110);
  if(contains(xml.scene, 'scene_pano')
    ,
    tween(view.vlookat, 30, 1.0, easeinoutquad);
    if(device.desktop, tween(view.oz, 1150, 2.0, easeinoutquad););
    if(device.tablet, tween(view.oz, 1380, 2.0, easeinoutquad););
    if(device.mobile, tween(view.oz, 2500, 2.0, easeinoutquad););
    ,
    if(device.desktop, tween(view.oz, 1150, 1, easeinoutquad););
    if(device.tablet, tween(view.oz, 1380, 1, easeinoutquad););
    if(device.mobile, tween(view.oz, 2500, 1, easeinoutquad););
    if(contains(xml.scene, 'floorplan'),
      <!-- change view from floor plan -> dollhouse view -->
      tween(view.hlookat|view.vlookat, 0|30, 1.0, easeinoutquad);
    );
  );
  jsget(autoTour, "document.querySelector('.wrapper-carousel')");
	jsget(autoTourNotStartedYet, "document.querySelector('.wrapper-carousel.not-started-yet')");
	jsget(anyActiveCarouselItem, "document.querySelector('.carousel-item.active');");
	if(autoTour,
		if(autoTourNotStartedYet AND !anyActiveCarouselItem, 
			tween(view.fov, 75, 1.5, easeinoutquad);
			,
			tween(view.fov, 115, 1.5, easeinoutquad);
		);
		,
		tween(view.fov, 75, 1.5, easeinoutquad);
	);
  tween(view.ox|view.oy, 0.0|0.0, 2.0, easeinoutquad); 
  tween(view.tx|view.ty|view.tz, 0.0|0.0|241.0|, 2.0, easeinoutquad); 
  loadscene(dollhouse, null, MERGE|KEEPMOVING, BLEND(0.25)); 
  tween(view.fovmin|view.fovmax, 20|135, 1.5, easeinoutquad);
  set(control.invert,true);
  wait(LOAD); 
  js(showHotspotsInCurrentScene());
</action>

<action name="dh_off"> 
  tween(view.oz, 0, 2.0); 
  set(control.invert,false); 
</action>

<action name="transition_to_floorplan">
  adjusthlookat(110);
  jsget(autoTour, "document.querySelector('.wrapper-carousel')");
	jsget(autoTourNotStartedYet, "document.querySelector('.wrapper-carousel.not-started-yet')");
	jsget(anyActiveCarouselItem, "document.querySelector('.carousel-item.active');");
	if(autoTour,
		if(autoTourNotStartedYet AND !anyActiveCarouselItem, 
			if(device.desktop, tween(view.oz|view.fov, 7000|9, 1.0, easeinoutquad););
			if(device.tablet, tween(view.oz|view.fov, 7000|11, 1.0, easeinoutquad););
			if(device.mobile, tween(view.oz|view.fov, 7000|25, 1.0, easeinoutquad););
			,
			if(device.desktop, tween(view.oz|view.fov, 7000|19, 1.0, easeinoutquad););
			if(device.tablet, tween(view.oz|view.fov, 7000|30, 1.0, easeinoutquad););
			if(device.mobile, tween(view.oz|view.fov, 7000|45, 1.0, easeinoutquad););
		);
		,
		if(device.desktop, tween(view.oz|view.fov, 7000|9, 1.0, easeinoutquad););
		if(device.tablet, tween(view.oz|view.fov, 7000|11, 1.0, easeinoutquad););
		if(device.mobile, tween(view.oz|view.fov, 7000|25, 1.0, easeinoutquad););
	);
  tween(view.tx|view.ty|view.tz, 0|0|0, 1.0, easeinoutquad);
  tween(view.hlookat|view.vlookat, 0|90, 1.0, easeinoutquad);
  loadscene(floorplan, null, MERGE|KEEPMOVING, BLEND(0.25)); 
  tween(view.fovmin|view.fovmax, 3|45, 1.5, easeinoutquad);
  set(control.invert,true);
  wait(BLEND);
  js(showHotspotsInCurrentScene());
</action>

<action name="floorplan_off">
  tween(view.oz, 0, 1);
  tween(view.fov|view.vlookat, 10|0, 2.0);
  set(control.invert,false); 
</action>
`;

const dollhouseAction = (actionName, dollhouseName) => `
<action name="${actionName}"> 
  set(view.fovmax, 135);
  adjusthlookat(110);
  if(contains(xml.scene, 'scene_pano')
    ,
    tween(view.vlookat, 30, 1, easeinoutquad);
    if(device.desktop, tween(view.oz, 1150, 2.0, easeinoutquad););
    if(device.tablet, tween(view.oz, 1380, 2.0, easeinoutquad););
    if(device.mobile, tween(view.oz, 2500, 2.0, easeinoutquad););
    ,
    if(device.desktop, tween(view.oz, 1150, 1, easeinoutquad););
    if(device.tablet, tween(view.oz, 1380, 1, easeinoutquad););
    if(device.mobile, tween(view.oz, 2500, 1, easeinoutquad););
    if(contains(xml.scene, 'floorplan'),
      <!-- change view from floor plan -> dollhouse view -->
      tween(view.hlookat|view.vlookat, 0|30, 1.0, easeinoutquad);
    );
  );
  jsget(autoTour, "document.querySelector('.wrapper-carousel')");
	jsget(autoTourNotStartedYet, "document.querySelector('.wrapper-carousel.not-started-yet')");
	jsget(anyActiveCarouselItem, "document.querySelector('.carousel-item.active');");
	if(autoTour,
		if(autoTourNotStartedYet AND !anyActiveCarouselItem, 
			tween(view.fov, 75, 1.5, easeinoutquad);
			,
			tween(view.fov, 115, 1.5, easeinoutquad);
		);
		,
		tween(view.fov, 75, 1.5, easeinoutquad);
	);
  tween(view.ox|view.oy, 0.0|0.0, 2.0, easeinoutquad); 
  tween(view.tx|view.ty|view.tz, 0.0|0.0|241.0|, 2.0, easeinoutquad); 
  loadscene(${dollhouseName}, null, MERGE|KEEPVIEW|KEEPMOVING, BLEND(0.25)); 
  tween(view.fovmin|view.fovmax, 20|135, 1.5, easeinoutquad);
  set(control.invert,true);
  wait(LOAD); 
  js(showHotspotsInCurrentScene());
</action>
`;

const floorplanAction = (actionName, floorplanName) => `
<action name="${actionName}">
  adjusthlookat(110);
  jsget(autoTour, "document.querySelector('.wrapper-carousel')");
	jsget(autoTourNotStartedYet, "document.querySelector('.wrapper-carousel.not-started-yet')");
	jsget(anyActiveCarouselItem, "document.querySelector('.carousel-item.active');");
	if(autoTour,
		if(autoTourNotStartedYet AND !anyActiveCarouselItem, 
			if(device.desktop, tween(view.oz|view.fov, 7000|9, 1.0, easeinoutquad););
			if(device.tablet, tween(view.oz|view.fov, 7000|11, 1.0, easeinoutquad););
			if(device.mobile, tween(view.oz|view.fov, 7000|25, 1.0, easeinoutquad););
			,
			if(device.desktop, tween(view.oz|view.fov, 7000|19, 1.0, easeinoutquad););
			if(device.tablet, tween(view.oz|view.fov, 7000|30, 1.0, easeinoutquad););
			if(device.mobile, tween(view.oz|view.fov, 7000|45, 1.0, easeinoutquad););
		);
		,
		if(device.desktop, tween(view.oz|view.fov, 7000|9, 1.0, easeinoutquad););
		if(device.tablet, tween(view.oz|view.fov, 7000|11, 1.0, easeinoutquad););
		if(device.mobile, tween(view.oz|view.fov, 7000|25, 1.0, easeinoutquad););
	);
  tween(view.tx|view.ty|view.tz, 0|0|0, 1.0, easeinoutquad);
  tween(view.hlookat|view.vlookat, 0|90, 1.0, easeinoutquad);
  loadscene(${floorplanName}, null, MERGE|KEEPMOVING, BLEND(0.25)); 
  tween(view.fovmin|view.fovmax, 3|30, 1.5, easeinoutquad); 
  set(control.invert,true);
  js(showHotspotsInCurrentScene());
</action>
`;

const Home = () => {
  const [floorNumber, setFloorNumber] = useState(2);
  const [xmlStyle, setXmlStyle] = useState({});
  const [listTy, setListTy] = useState({});
  const [cameraDistance, setCameraDistance] = useState(-120);
  const [xmlResult, setXmlResult] = useState(``);
  const [textureFileName, setTextureFileName] = useState(``);
  const [musicFeature, setMusicFeature] = useState(false);
  const [autotourFeature, setAutotourFeature] = useState(false);
  const [floorplan2DFeature, setFloorplan2DFeature] = useState(false);
  const placeholderTextArea = `<style name="style_pano1" tx="-3914.86" ty="-139.94" tz="-1606.44" ox="-3914.86" oy="-139.94" oz="-1606.44" origin="39.15, 1.4, 16.06" align="1.3|64.72|-0.19" />
<style name="style_pano2" tx="-3855.8" ty="-137.01" tz="-1440.73" ox="-3855.8" oy="-137.01" oz="-1440.73" origin="38.56, 1.37, 14.41" align="1.04|94.47|0.81" />
<style name="style_pano3" tx="-3630.97" ty="-134.61" tz="-1501.94" ox="-3630.97" oy="-134.61" oz="-1501.94" origin="36.31, 1.35, 15.02" align="1.9|93.95|0.55" />
<style name="style_pano4" tx="-3880.24" ty="-135.58" tz="-1182.37" ox="-3880.24" oy="-135.58" oz="-1182.37" origin="38.8, 1.36, 11.82" align="-0.1|101.09|0.8" />
  `;

  const onChange = (i, e) => {
    console.log("🚀 ~ file: index.jsx ~ line 163 ~ onChange ~ i,e", i, e);
    setXmlStyle({ ...xmlStyle, [i]: e.target.value.trim() });
    console.log(
      "🚀 ~ file: index.jsx ~ line 165 ~ onChange ~ xmlStyle",
      xmlStyle
    );
  };

  const onChangeTy = (i, value) => {
    setListTy({ ...listTy, [i]: value });
  };

  const onChangeDistance = (value) => {
    setCameraDistance(value);
  };

  const downloadXML = () => {
    let all_scene = "";
    let dollhouse_scene = "";
    let floor_scene = "";
    let all_hotspot = "";
    let xml_style = "";
    let xml_result = "";
    let hotspotList = [];
    let dollhouseAndFloorplanAction =
      commonActionTransitionForDollhouseAndFloorplan();

    for (const property in xmlStyle) {
      xml_style += `\n${xmlStyle[property]}`;
    }

    dollhouse_scene = sceneDollhouseOrFloorTemplate(true, textureFileName);

    floor_scene = sceneDollhouseOrFloorTemplate(false, textureFileName, "", {
      name: "floorplan",
      title: "Floorplan",
      style: "Style_floorplan",
      sphereURL: `dollhouse/${textureFileName}`,
      depthmapURL: "dollhouse/dollhouse.obj",
      texURL: "dollhouse/dollhouse.mtl",
    });

    Array.from(Array(floorNumber), (e, index) => {
      let xmlStylePerFloor = xmlStyle[index];
      let xml = new XMLParser().parseFromString(`<array
                name="integer_array_name">${xmlStylePerFloor}</array>`);
      let array = xml.getElementsByTagName("array");
      let hotspots_per_floor = "";
      let hotspots_per_dollhouse = "";

      for (let i = 0, j = array[0].children.length; i < j; i++) {
        let pn = array[0].children[i];
        let pano_id = pn.attributes.name.trim().split("pano")[1];
        let decimalFloatTy = parseFloat(pn.attributes.ty);

        // append hotspots
        all_hotspot += hotSpotTemplate({
          name: `hotspot_${pano_id}`,
          style: hotSpotStyleName,
          tx: pn.attributes.ox,
          ty: checkKey(index, listTy)
            ? parseFloat(listTy[index].toFixed(2))
            : pn.attributes.oy,
          tz: pn.attributes.oz,
          distance: checkKey(index, listTy) ? 0 : cameraDistance,
        });

        all_scene += scenePanoTemplate(
          pano_id,
          pn.attributes.origin,
          pn.attributes.align
        );

        hotspotList.push({
          id: pano_id,
          name: `hotspot${pano_id}`,
          scene: `scene_pano${pano_id}`,
          tx: parseFloat(pn.attributes.tx),
          ty: checkKey(index, listTy)
            ? parseFloat(listTy[index].toFixed(2))
            : parseFloat((decimalFloatTy - cameraDistance).toFixed(2)),
          tz: parseFloat(pn.attributes.tz),
          floor: `floor${index + 1}`,
        });

        hotspots_per_dollhouse += hotSpotTemplate({
          name: `hotspotdollhouse_${pano_id}`,
          style: `hotspot_dollhouse_and_floorplan`,
          tx: pn.attributes.ox,
          ty: checkKey(index, listTy)
            ? parseFloat(listTy[index].toFixed(2))
            : pn.attributes.oy,
          tz: pn.attributes.oz,
          distance: checkKey(index, listTy) ? 0 : cameraDistance,
        });

        hotspots_per_floor += hotSpotTemplate({
          name: `hotspotfloorplan_${pano_id}`,
          style: `hotspot_dollhouse_and_floorplan`,
          tx: pn.attributes.ox,
          ty: checkKey(index, listTy)
            ? parseFloat(listTy[index].toFixed(2))
            : pn.attributes.oy,
          tz: pn.attributes.oz,
          distance: checkKey(index, listTy) ? 0 : cameraDistance,
        });
      }

      if (floorNumber >= 2) {
        dollhouse_scene += sceneDollhouseOrFloorTemplate(
          true,
          textureFileName,
          hotspots_per_dollhouse,
          {
            name: `dollhouse${index + 1}`,
            title: `Dollhouse${index + 1}`,
            style: `Style_dollhouse`,
            sphereURL: `dollhouse/${textureFileName}`,
            depthmapURL: `dollhouse/floor${index + 1}.obj`,
            texURL: `dollhouse/floor${index + 1}.mtl`,
          }
        );

        floor_scene += sceneDollhouseOrFloorTemplate(
          false,
          textureFileName,
          hotspots_per_floor,
          {
            name: `floorplan${index + 1}`,
            title: `Floorplan${index + 1}`,
            style: `Style_floorplan`,
            sphereURL: `dollhouse/${textureFileName}`,
            depthmapURL: `dollhouse/floor${index + 1}.obj`,
            texURL: `dollhouse/floor${index + 1}.mtl`,
          }
        );

        dollhouseAndFloorplanAction += dollhouseAction(
          `transition_to_dh${index + 1}`,
          `Dollhouse${index + 1}`
        );
        dollhouseAndFloorplanAction += floorplanAction(
          `transition_to_floorplan${index + 1}`,
          `floorplan${index + 1}`
        );
      }

      return;
    });

    console.log("hotspotList", hotspotList);

    all_scene += dollhouse_scene;
    all_scene += floor_scene;

    xml_result = krpanoTemplate(
      xml_style,
      all_hotspot,
      all_scene,
      dollhouseAndFloorplanAction,
      {
        musicFeature: musicFeature,
        autotourFeature: autotourFeature,
        floorplan2DFeature: floorplan2DFeature,
        floorNumber: floorNumber,
      }
    );

    // Download XML
    const element = document.createElement("a");
    const file = new Blob([xml_result], {
      type: "text/xml",
    });
    element.href = URL.createObjectURL(file);
    element.download = "tour.xml";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    setXmlResult(xml_result);
  };

  return (
    <Container>
      <h1>Get XML File</h1>
      <FromItem>
        <FromLable>Texture File Name</FromLable>
        <Input
          placeholder="texture.jpg"
          onChange={(e) => {
            setTextureFileName(e.target.value);
          }}
        />
      </FromItem>
      <FromItem>
        <FromLable>Include Feature</FromLable>
        <Checkbox
          onChange={(e) => {
            setMusicFeature(e.target.checked);
          }}
        >
          Music Background
        </Checkbox>
        <Checkbox
          onChange={(e) => {
            setAutotourFeature(e.target.checked);
          }}
        >
          Autotour
        </Checkbox>
        <Checkbox
          onChange={(e) => {
            setFloorplan2DFeature(e.target.checked);
          }}
        >
          Floorplan2D
        </Checkbox>
      </FromItem>
      <FromItem>
        <FromLable>Number of Floor</FromLable>
        <Radio.Group
          defaultValue={floorNumber}
          buttonStyle="solid"
          onChange={(e) => {
            setFloorNumber(e.target.value);
          }}
        >
          <Radio.Button value={1}>1</Radio.Button>
          <Radio.Button value={2}>2</Radio.Button>
          <Radio.Button value={3}>3</Radio.Button>
          <Radio.Button value={4}>4</Radio.Button>
          <Radio.Button value={5}>5</Radio.Button>
          <Radio.Button value={6}>6</Radio.Button>
          <Radio.Button value={7}>7</Radio.Button>
          <Radio.Button value={8}>8</Radio.Button>
          <Radio.Button value={9}>9</Radio.Button>
          <Radio.Button value={10}>10</Radio.Button>
        </Radio.Group>
      </FromItem>

      {Array.from(Array(floorNumber), (e, i) => {
        return (
          <GroupFrom key={i}>
            <GroupFromLabel>Floor {i + 1}</GroupFromLabel>
            <FromItem>
              <FromLable>
                Enter oy coordinates (leave blank if you want to get
                automatically)
              </FromLable>
              <InputNumber onChange={(value) => onChangeTy(i, value)} />
              <FromLable>XML Style</FromLable>
              <TextArea
                style={{ height: 200 }}
                onChange={(event) => onChange(i, event)}
                defaultValue={xmlStyle[i] || ""}
                placeholder={placeholderTextArea}
              ></TextArea>
            </FromItem>
          </GroupFrom>
        );
      })}
      <FromItem>
        <FromLable>Camera Distance</FromLable>
        <InputNumber
          onChange={(value) => onChangeDistance(value)}
          defaultValue={cameraDistance}
        />
      </FromItem>

      <FromItem>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={() => downloadXML()}
        >
          Download XML
        </Button>
      </FromItem>
      <FromItem>
        <TextArea value={xmlResult} style={{ height: 600 }}></TextArea>
      </FromItem>
    </Container>
  );
};
export default Home;
