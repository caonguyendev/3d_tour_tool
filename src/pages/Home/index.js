import React, { useState } from "react";
import Container from "../../common/Container";
import styled from "styled-components";
import { Input, InputNumber, Radio, Button } from "antd";
import XMLParser from "react-xml-parser";

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

const { TextArea } = Input;

const ImageResolution = {
  "4K": "4K",
  "8K": "8K",
  "12K": "12K",
  "16K": "16K",
};

const krpanoTemplate = (
  styles,
  hotspots,
  scenes,
  dollhouses
) => `<krpano version="1.21" title="Virtual Tour" onstart="onLoadedXML();">

<include url="plugins/contextmenu.xml" />
<include url="plugins/showtext.xml" />
<include url="plugins/preload.xml" />
<include url="plugins/footer.xml" />
<include url="plugins/depthmap_measure3d.xml" />
<include url="plugins/depthmap_navigation.xml"/>
<include url="toolbox/stickie_data.xml" />

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

  <action name="onLoadedXML">
		set(global,
			prevScene:string='scene_pano1',
		);
		tween(view.vlookat, 30, 2.0, easeinoutquad); 
		transition_to_dh();
		trace(layer[depthmap_measure3d_ui].interactive);
	</action>

	<action name="checkAndHideSelectFloor" type="Javascript"><![CDATA[
		const isFloorSelectShowing = document.querySelector(".floorselect_box_ui.show");
		if(isFloorSelectShowing) {
			isFloorSelectShowing.classList.remove('show');
		}
	]]></action>

	<events name="local_event" keep="true" onclick="checkAndHideSelectFloor();" onkeydown="action(keydown);" />

  <action name="keydown">
		if(keycode == charcode('1'), 
			if(layer['btn-explore-3d-space'].visible, 
				tour3d_loadscene(get(prevScene));toggleExplore3DSpace();
			);
		);
		if(keycode == charcode('2'), 
			if(layer['btn-dollhouse'].visible, 
				loadFloorDollhousSceneBySelectedFloor();handleOnClickDollhouse();
			);
		);
		if(keycode == charcode('3'), 
			if(layer['btn-floorplan'].visible, 
				loadFloorSceneBySelectedFloor();toggleFloorPlan();
			);
		);
	</action>

	<action name="showHotspotsScenePano" scope="local" args="isshow">
		for(set(i,0), i LE hotspot.count, inc(i), 
			if(contains(hotspot[get(i)].name, 'hotspot_'),
				set(hotspot[get(i)].visible, get(isshow)); 
			);
		);
	</action>

  <!-- Load Scene 3D  -->
  <action name="tour3d_loadscene" scope="local" args="scenename">
		if(xml.scene === 'dollhouse', dh_off();); 
		if(xml.scene === 'dollhouse1', dh_off();); 
		if(xml.scene === 'dollhouse2', dh_off();); 
		if(xml.scene === 'floorplan1', floorplan_off();); 
		if(xml.scene === 'floorplan2', floorplan_off();); 
		if(xml.scene === 'floorplan', floorplan_off(););

		currentSceneBeforeClickLoadScene = xml.scene;
		
		set(global,
			prevScene:string=get(scenename),
		);
		loadscene(get(scenename), null, MERGE|KEEPVIEW|KEEPMOVING, BLEND(0.75)); 
		tween(view.fovmin|view.fovmax, 25|120, 1.5, easeinoutquad);
		if (global.customtransition != 'SKIP', 
			if(global.customtransition !== null, 
				global.customtransition(); 
			, 
				if(device.normal, tween(view.fov, 90, 1.5, easeinoutquad););
				if(device.mobile, tween(view.fov, 120, 1.5, easeinoutquad););
				
				tween(view.tx|view.ty|view.tz, calc(image.ox + '|' + image.oy + '|' + image.oz), 1.5, easeinoutsine);
			); 
		); 
		delete(global.customtransition); 
		delete(global.customtransitiontime); 

		wait(LOAD);
		showHotspotsScenePano("true");

		<!-- If click load scene at floor plan view -->
		if(currentSceneBeforeClickLoadScene !== 'dollhouse', 
			set(layer[btn-dollhouse].x, 20);
			set(layer[btn-floorplan].visible, true); 
		);
		<!-- If click load scene at dollhouse view -->
		if(currentSceneBeforeClickLoadScene == 'dollhouse', 
			set(layer[btn-dollhouse].x, 20);
		);
		if( get(layer[btn-explore-3d-space].visible), set(layer[btn-explore-3d-space].visible, false); );
		if( get(layer[btn-dollhouse].visible) == false, set(layer[btn-dollhouse].visible, true); );
	</action>

<style name="hotspotvtour4" type="text" keep="true" visible="true" distorted="true" depth="0" depthbuffer="true" rotationorder="xzy" width="40" height="40" rx="90" ty="0" scale="0.2" bgcolor="0xffffff" bgalpha="0" bgborder="10 0xffffff 1" bgroundedge="30" bgshadow="0 0 10 0x000000 0.6" ondown.addevent="tween(scale|bgalpha, 0.45|0.4 ,0.2); " onup.addevent="tween(scale|bgalpha, 0.5|0 ,0.2); " onover.addevent="tween(scale|bgalpha, 0.35|0.4 ,0.2); " onout.addevent="tween(scale|bgalpha, 0.2|0 ,0.2); "/>
<style name="hotspot_dollhouse_and_floorplan" type="text" distorted="true" depth="0" depthbuffer="true" rotationorder="xzy" width="40" height="40" rx="90" ty="0" scale="0.2" bgcolor="0xffffff" bgalpha="0" bgborder="10 0xffffff 1" bgroundedge="30" bgshadow="0 0 10 0x000000 0.6" ondown.addevent="tween(scale|bgalpha, 0.45|0.4 ,0.2); " onup.addevent="tween(scale|bgalpha, 0.5|0 ,0.2); " onover.addevent="tween(scale|bgalpha, 0.35|0.4 ,0.2); " onout.addevent="tween(scale|bgalpha, 0.2|0 ,0.2); "/>
<style name="style_dollhouse_and_floorplan" prealign="0|0|0" ox="0" oy="0" oz="0" />
<style name="Style_floorplan1" prealign="0|0|0" ox="0" oy="0" oz="0"/>
<style name="Style_floorplan2" prealign="0|0|0" ox="0" oy="0" oz="0"/>${styles}

<!-- hotspots  -->
${hotspots}

<!-- scene pano  -->
${scenes}
<!-- Action  -->
${dollhouses}

</krpano>`;

const scenePanoTemplate = (pano_id, origin, align) => {
  // let multires;
  // switch (imageResolution) {
  //   case ImageResolution["4K"]:
  //     multires = "512,640,1280";
  //     break;
  //   case ImageResolution["8K"]:
  //     multires = "512,640,1280,2624";
  //     break;
  //   case ImageResolution["12K"]:
  //     multires = "512,1024,2048,3840";
  //     break;
  //   default:
  //     multires = "512,640,1280,2624,5248";
  //     break;
  // }
  return `\n<scene name="scene_pano${pano_id}" title="pano${pano_id}" onstart="" thumburl="panos/pano${pano_id}.tiles/thumb.jpg" lat="" lng="" alt="" heading="">

 <control bouncinglimits="calc:image.cube ? true : false" />

 <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" fov="90" maxpixelzoom="1.0" limitview="auto" />

 <preview url="panos/pano${pano_id}.tiles/preview.jpg" />

 <image style="style_pano${pano_id}">
    <cube url="panos/pano${pano_id}.tiles/pano_%s.jpg" />
    <depthmap url="model/model.depth"
    enabled="true"
    rendermode="3dmodel"
    backgroundurl="images/black.svg"
    scale="100"
    offset="0.0"
    subdiv=""
    encoding="gray"
    axis="+x+y+z"
    cull="front"
    hittest="true"
    origin="${origin}"
    align="${align}"
 />
 </image>
</scene>
`;
};

const sceneDollhouseOrFloorTemplate = (
  isDollhouseScene,
  hotspots = '',
  scene = {
    name: "Dollhouse",
    title: "Dollhouse",
    style: "style_dollhouse_and_floorplan",
    sphereURL: "dollhouse/bake.jpg",
    depthmapURL: "dollhouse/dollhouse.obj",
    texURL: "dollhouse/dollhouse.mtl"
  }
) => `
  ${
    isDollhouseScene ? "<!-- Dollhouse Scene -->" : "<!--  Floorplan Scene  -->"
  }
<scene name="${scene.name}" title="${
  scene.title
}" onstart="" lat="" lng="" heading="" css="z-index: 9999;">
 <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" fov="90" maxpixelzoom="1.0" limitview="auto" />
 <image style="${scene.style}">
  <sphere url="${scene.sphereURL}" />
  <depthmap url="${
    scene.depthmapURL
  }" texurl="${scene.texURL}" backgroundurl="images/black.svg" enabled="true" rendermode="3dmodel" textured="true" background="none" scale="100" offset="0" subdiv="" encoding="gray" cull="front" hittest="true" />
 </image> ${hotspots}
</scene>
`;

const hotSpotTemplate = ({ name, style, tx, ty, tz, distance, handler }) =>
  `\n <hotspot name="${name}" style="${style}" tx="${tx}" ty="${(
    parseFloat(ty) - distance
  ).toFixed(
    2
  )}" tz="${tz}" rx="-90.0" ry="-0.0" rz="0.0" onclick="${handler}" />`;

// Dollhouse and Floorplan Action
const commonActionTransitionDollhouseAndFloorplan = () => `
<action name="dh_off"> 
  tween(view.oz|view.vlookat, 0|0, 2.0); 
  set(control.invert,false); 
</action>
	
<!--  Transition to dollhouse   -->
<action name="transition_to_dh"> 
  adjusthlookat(110);
  if(contains(xml.scene, 'scene_pano')
    ,
    tween(view.oz, 1280, 2.0, easeinoutquad); 
    if(device.desktop, lookto(0,30,70,default,true,true););
    if(device.tablet, lookto(0,30,90,default,true,true););
    if(device.mobile, lookto(0,30,135,default,true,true););
    ,
    tween(view.oz, 1280, 1, easeinoutquad); 
    if(contains(xml.scene, 'floorplan'),
      <!-- change view from floor plan -> dollhouse view -->
      if(device.desktop, lookto(0,30,70,default,true,true););
      if(device.tablet, lookto(0,30,90,default,true,true););
      if(device.mobile, lookto(0,30,135,default,true,true););
      ,
      <!-- keep view if in dollhouse -->
      if(device.desktop, tween(view.fov, 70.0, 2.0, easeinoutquad););
      if(device.tablet, tween(view.fov, 90.0, 2.0, easeinoutquad););
      if(device.mobile, tween(view.fov, 135.0, 2.0, easeinoutquad););
    )
  );
  tween(view.ox|view.oy, 0.0|0.0, 2.0, easeinoutquad); 
  tween(view.tx|view.ty|view.tz, 0.0|0.0|241.0|, 2.0, easeinoutquad); 
  loadscene(Dollhouse, null, MERGE|KEEPMOVING, BLEND(0.25)); 
  tween(view.fovmin|view.fovmax, 20|135, 1.5, easeinoutquad);
  set(control.invert,true);
  wait(LOAD); 
  showHotspotsScenePano("true");
</action>

<action name="floorplan_off">
  tween(view.oz, 0, 1);
  tween(view.fov|view.vlookat, 10|0, 2.0);
  set(control.invert,false); 
  <!-- wait(1.0); -->
</action>

<action name="transition_to_floorplan">
  tween(view.fovmin|view.fovmax, 3|30, 1.5, easeinoutquad);
  if(device.normal, lookto(0,90,10,default,true,true););
  if(device.mobile, lookto(0,90,27,default,true,true););
  tween(view.oz|view.tx|view.ty|view.tz,calc(''+7000+'|'+image.ox+'|'+image.oy+'|'+image.oz), 1.0, easeinoutquad); 
  loadscene(floorplan, null, MERGE|KEEPMOVING, BLEND(0.25)); 
  set(control.invert,true);
  wait(BLEND);
  showHotspotsScenePano("true");
</action>
`;

const dollhouseAction = (actionName, dollhouseName) => `
<action name="${actionName}"> 
  showHotspotsScenePano("false");
  adjusthlookat(110);
  if(contains(xml.scene, 'scene_pano')
    ,
    tween(view.oz, 1280, 2.0, easeinoutquad); 
    if(device.desktop, lookto(0,30,70,default,true,true););
    if(device.tablet, lookto(0,30,90,default,true,true););
    if(device.mobile, lookto(0,30,135,default,true,true););
    ,
    tween(view.oz, 1280, 1, easeinoutquad); 
    if(contains(xml.scene, 'floorplan'),
      if(device.desktop, lookto(0,30,70,default,true,true););
      if(device.tablet, lookto(0,30,90,default,true,true););
      if(device.mobile, lookto(0,30,135,default,true,true););
      ,
      if(device.desktop, tween(view.fov, 70.0, 2.0, easeinoutquad););
      if(device.tablet, tween(view.fov, 90.0, 2.0, easeinoutquad););
      if(device.mobile, tween(view.fov, 135.0, 2.0, easeinoutquad););
    )
  );
  tween(view.ox|view.oy, 0.0|0.0, 2.0, easeinoutquad); 
  tween(view.tx|view.ty|view.tz, 0.0|0.0|241.0|, 2.0, easeinoutquad); 
  loadscene(${dollhouseName}, null, MERGE|KEEPVIEW|KEEPMOVING, BLEND(0.25)); 
  tween(view.fovmin|view.fovmax, 20|135, 1.5, easeinoutquad);
  set(control.invert,true);
  wait(LOAD); 
</action>
`

const floorplanAction = (actionName, floorplanName) => `
<action name="${actionName}">
  showHotspotsScenePano("false");
  tween(view.fovmin|view.fovmax, 3|30, 1.5, easeinoutquad);
  if(device.normal, lookto(0,90,10,default,true,true););
  if(device.mobile, lookto(0,90,27,default,true,true);); 
  tween(view.oz|view.tx|view.ty|view.tz,calc(''+7000+'|'+image.ox+'|'+image.oy+'|'+image.oz), 1.0, easeinoutquad); 
  loadscene(${floorplanName}, null, MERGE|KEEPVIEW|KEEPMOVING, BLEND(0.25)); 
  set(control.invert,true);
</action>
`

const Home = () => {
  const [floorNumber, setFloorNumber] = useState(2);
  const [imageResolution, setImageResolution] = useState("4K");
  const [xmlStyle, setXmlStyle] = useState({});
  const [cameraDistance, setCameraDistance] = useState(-120);
  const [xmlResult, setXmlResult] = useState(``);

  const onChange = (i, e) => {
    console.log("🚀 ~ file: index.jsx ~ line 163 ~ onChange ~ i,e", i, e);
    setXmlStyle({ ...xmlStyle, [i]: e.target.value.trim() });
    console.log(
      "🚀 ~ file: index.jsx ~ line 165 ~ onChange ~ xmlStyle",
      xmlStyle
    );
  };

  const onChangeDistance = (value) => {
    setCameraDistance(value);
  };

  const onChangeImageResolution = (event) => {
    setImageResolution(event.target.value);
  };

  const downloadXML = () => {
    let all_scene = "";
    let dollhouse_scene = "";
    let floor_scene = "";
    let all_hotspot = "";
    let xml_style = "";
    let xml_result = "";
    let dollhouseAndFloorplanAction = commonActionTransitionDollhouseAndFloorplan();

    for (const property in xmlStyle) {
      xml_style += `\n${xmlStyle[property]}`;
    }

    let xml = new XMLParser().parseFromString(`<array
                name="integer_array_name">${xml_style}</array>`);
    let array = xml.getElementsByTagName("array");

    for (let i = 0, j = array[0].children.length; i < j; i++) {
      let pn = array[0].children[i];
      let pano_id = pn.attributes.name.trim().split("pano")[1];

      all_hotspot += hotSpotTemplate({
        name: `hotspot_${pano_id}`,
        style: hotSpotStyleName,
        tx: pn.attributes.ox,
        ty: pn.attributes.oy,
        tz: pn.attributes.oz,
        distance: cameraDistance,
        handler: `tour3d_loadscene(scene_pano${pano_id});`,
      });

      all_scene += scenePanoTemplate(pano_id, pn.attributes.origin, pn.attributes.align);
    }

    dollhouse_scene = sceneDollhouseOrFloorTemplate(
      true,
    );

    floor_scene = sceneDollhouseOrFloorTemplate(
      false,
      '',
      {
        name: "floorplan",
        title: "Floorplan",
        style: "style_dollhouse_and_floorplan",
        sphereURL: "dollhouse/bake.jpg",
        depthmapURL: "dollhouse/dollhouse.obj",
        texURL: "dollhouse/dollhouse.mtl"
      }
    );

    Array.from(Array(floorNumber), (e, i) => {
      let xmlStylePerFloor = xmlStyle[i];
      let xml = new XMLParser().parseFromString(`<array
                name="integer_array_name">${xmlStylePerFloor}</array>`);
      let array = xml.getElementsByTagName("array");
      let hotspots_per_floor = "";
      let hotspots_per_dollhouse = "";

      for (let i = 0, j = array[0].children.length; i < j; i++) {
        let pn = array[0].children[i];
        let pano_id = pn.attributes.name.trim().split("pano")[1];

        hotspots_per_dollhouse += hotSpotTemplate({
          name: `hotspotdollhouse_${pano_id}`,
          style: `hotspot_dollhouse_and_floorplan`,
          tx: pn.attributes.ox,
          ty: pn.attributes.oy,
          tz: pn.attributes.oz,
          distance: cameraDistance,
          handler: `tour3d_loadscene(scene_pano${pano_id});`,
        });

        hotspots_per_floor += hotSpotTemplate({
          name: `hotspotfloorplan_${pano_id}`,
          style: `hotspot_dollhouse_and_floorplan`,
          tx: pn.attributes.ox,
          ty: pn.attributes.oy,
          tz: pn.attributes.oz,
          distance: cameraDistance,
          handler: `tour3d_loadscene(scene_pano${pano_id});`,
        });
      }

      dollhouse_scene += sceneDollhouseOrFloorTemplate(
        true,
        hotspots_per_dollhouse,
        {
          name: `Dollhouse${i + 1}`,
          title: `Dollhouse${i + 1}`,
          style: `style_dollhouse_and_floorplan`,
          sphereURL: `dollhouse/bake${i + 1}.jpg`,
          depthmapURL: `dollhouse/floor${i + 1}.obj`,
          texURL: `dollhouse/floor${i + 1}.mtl`
        }
      );

      floor_scene += sceneDollhouseOrFloorTemplate(false, hotspots_per_floor, {
        name: `floorplan${i + 1}`,
        title: `Floorplan${i + 1}`,
        style: `hotspot_dollhouse_and_floorplan`,
        sphereURL: `dollhouse/bake${i + 1}.jpg`,
        depthmapURL: `dollhouse/floor${i + 1}.obj`,
        texURL: `dollhouse/floor${i + 1}.mtl`
      });

      dollhouseAndFloorplanAction += dollhouseAction(`transition_to_dh${i + 1}`, `Dollhouse${i + 1}`);
      dollhouseAndFloorplanAction += floorplanAction(`transition_to_floorplan${i + 1}`, `floorplan${i + 1}`);

      return;
    });

    all_scene += dollhouse_scene;
    all_scene += floor_scene;

    xml_result = krpanoTemplate(
      xml_style,
      all_hotspot,
      all_scene,
      dollhouseAndFloorplanAction
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
      <h1>Demo</h1>
      <div>Number of floor:</div>
      <Radio.Group
        defaultValue={floorNumber}
        onChange={(e) => {
          setFloorNumber(e.target.value);
        }}
      >
        <Radio.Button value={1}>1</Radio.Button>
        <Radio.Button value={2}>2</Radio.Button>
        <Radio.Button value={3}>3</Radio.Button>
        <Radio.Button value={4}>4</Radio.Button>
      </Radio.Group>

      {Array.from(Array(floorNumber), (e, i) => {
        return (
          <GroupFrom key={i}>
            <GroupFromLabel>Floor {i + 1}</GroupFromLabel>
            <FromItem>
              <FromLable>XML Style</FromLable>
              <TextArea
                style={{ height: 200 }}
                onChange={(event) => onChange(i, event)}
                defaultValue={xmlStyle[i] || ""}
              ></TextArea>
            </FromItem>
          </GroupFrom>
        );
      })}
      <FromItem>
        <FromLable>Camera distance</FromLable>
        <InputNumber
          onChange={(value) => onChangeDistance(value)}
          defaultValue={cameraDistance}
        />
      </FromItem>

      <FromItem>
        <FromLable>Image Resolution</FromLable>
        <Radio.Group
          defaultValue={ImageResolution["4K"]}
          buttonStyle="solid"
          onChange={(event) => onChangeImageResolution(event)}
        >
          <Radio.Button value={ImageResolution["4K"]}>4K</Radio.Button>
          <Radio.Button value={ImageResolution["8K"]}>8K</Radio.Button>
          <Radio.Button value={ImageResolution["12K"]}>12K</Radio.Button>
          <Radio.Button value={ImageResolution["16K"]}>16K</Radio.Button>
        </Radio.Group>
      </FromItem>

      <FromItem>
        <Button type="primary" onClick={() => downloadXML()}>
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
