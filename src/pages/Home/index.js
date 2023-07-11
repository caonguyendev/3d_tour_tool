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
  scenes,
  dollhouses,
  actions
) => `<krpano version="1.20.9" title="Virtual Tour">

<include url="plugins/contextmenu.xml" />
<include url="plugins/showtext.xml" />


<!-- startup action - load the first scene -->
<events name="tourevents" keep="true" onxmlcomplete="setup_first_scene();"/>
<action name="setup_first_scene" scope="local">
  set(view, tx=get(image.ox), ty=get(image.oy), tz=get(image.oz));
  set(events[tourevents].onxmlcomplete, null); set(events[tourevents].onloadcomplete) );
</action>
<action name="startup" autorun="onstart">
  if(startscene === null OR !scene[get(startscene)], copy(startscene,scene[0].name); );
  loadscene(get(startscene), null, MERGE); if(startactions !== null, startactions() );
</action>


<!-- 3D Transition  -->
<action name="tour3d_loadscene" scope="local" args="scenename">
  loadscene(get(scenename), null, MERGE|KEEPVIEW|KEEPMOVING, BLEND(0.75));
  if (global.customtransition != 'SKIP', if(global.customtransition !== null, global.customtransition(); ,
  tween(view.tx|view.ty|view.tz, calc(image.ox + '|' + image.oy + '|' + image.oz), 1.0, easeinoutsine); ); );
  delete(global.customtransition); delete(global.customtransitiontime);
</action>

<style name="hotspotvtour4" url="vtourskin_hotspot.png" scale="0.025" alpha="0" bgcolor="0xFFFF00" bgroundedge="50" bgborder="2 0x000000 1" oversampling="2" mipmapping="true" zorder="2" distorted="true" depth="0" depthbuffer="true" torigin="world" rotationorder="xzy" onloaded.addevent="delayedcall(1.3, tween(alpha,0.3); );" onover="tween(scale,0.032);" onout.addevent="tween(scale,0.025);" />
<style name="Style_Dollhouse" prealign="0|0|0" ox="0" oy="0" oz="0" />
${styles}


<!-- scene pano  -->
${scenes}
<!-- style dollhouse  -->
${dollhouses}
<!-- actions   -->
${actions}

</krpano>`;

const sceneTemplate = (pano_id, hotspots, imageResolution) => {
  let multires;
  switch (imageResolution) {
    case ImageResolution["4K"]:
      multires = "512,640,1280";
      break;
    case ImageResolution["8K"]:
      multires = "512,640,1280,2624";
      break;
    case ImageResolution["12K"]:
      multires = "512,1024,2048,3840";
      break;
    default:
      multires = "512,640,1280,2624,5248";
      break;
  }
  return `\n<scene name="scene_pano${pano_id}" title="pano${pano_id}" onstart="" thumburl="panos/pano${pano_id}.tiles/thumb.jpg" lat="" lng="" heading="">

 <control bouncinglimits="calc:image.cube ? true : false" />

 <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" fov="120" maxpixelzoom="2.0" fovmin="70" fovmax="140" limitview="auto" />

 <preview url="panos/pano${pano_id}.tiles/preview.jpg" />

 <image style="style_pano${pano_id}">
    <cube url="panos/pano${pano_id}.tiles/%s/l%l/%0v/l%l_%s_%0v_%0h.jpg" multires="${multires}" />
    <depthmap url="stl/pano${pano_id}.stl"
    enabled="true"
    rendermode="3dmodel"
    background="none"
    scale="100"
    offset="0.0"
    subdiv=""
    encoding="gray"
    axis="+x+y+z"
    cull="front"
    center="0,0,0"
 />
 </image>
${hotspots}
</scene>
`;
};

const sceneDollhouseOrFloorTemplate = (
  isDollhouseScene,
  hotspots,
  scence = {
    name: "Dollhouse",
    title: "Dollhouse",
    style: "Style_Dollhouse",
    sphereURL: "dollhouse/bake.jpg",
    depthmapURL: "dollhouse/dollhouse.obj",
  }
) => `
  ${
    isDollhouseScene ? "<!-- Dollhouse Scene -->" : "<!--  Floorplan Scene  -->"
  }
<scene name="${scence.name}" title="${
  scence.title
}" onstart="" lat="" lng="" heading="">
 <view hlookat="0.0" vlookat="0.0" fovtype="MFOV" fov="120" maxpixelzoom="2.0" fovmin="70" fovmax="140" limitview="auto" />
 <image style="${scence.style}">
  <sphere url="${scence.sphereURL}" />
  <depthmap url="${
    scence.depthmapURL
  }"enabled="true" rendermode="3dmodel" textured="true" background="none" scale="100" offset="0" subdiv="" encoding="gray" cull="front"/>
 </image> ${hotspots}
</scene>
`;

const hotSpotTemplate = ({ name, style, x, y, z, distance, handler }) =>
  `\n <hotspot name="${name}" style="${style}" tx="${x}" ty="${(
    parseFloat(y) - distance
  ).toFixed(
    2
  )}" tz="${z}" rx="-90.0" ry="-0.0" rz="0.0" onclick="${handler}" />`;

const dollhouseTemplate = (id) => `
<!-- layer dollhouse  -->
<layer name="btn-dollhouse" type="image" url="dollhouse/dollhouse.png" keep="true" align="leftbottom" x="90" y="20" scale="0.7" visible="true" onhover="showtext(Dollhouse,menuehover);" onclick="loadscene(Dollhouse,null,PRELOAD|MERGE|KEEPMOVING|KEEPSCENES, BLEND(0.15)); wait(0.1); dollhouse_view_${id}();" />
<action name="dollhouse_view_${id}">
  lookto(0,50,90,default,true,true);
  tween(view.oz|view.tx|view.ty|view.tz,calc(''+2500+'|'+image.ox+'|'+image.oy+'|'+image.oz), 1.0, easeinoutquad);
  set(control.invert,true);
  tween(view.architectural, 0.0, distance(1.0,0.5));
  tween(view.pannini,       0.0, distance(1.0,0.5));
  tween(view.fisheye,       0.0, distance(1.0,0.5));
</action>
`;

const hotSpotDollhouseActionTemplate = (
  id,
  x,
  y,
  z
) => `<action name="transition_dh_to_scene_pano${id}" scope="local">
  tween(view.tx|view.ty|view.tz|view.vlookat,${x}|${y}|${z}|0, 2.0, easeinoutquad);
  loadscene(scene_pano${id}, null, MERGE|KEEPVIEW|KEEPMOVING, BLEND(0.75));
  wait(1);
  tween(view.ox|view.oy|view.oz|view.fov, 0.0|0.0|0.0|120, 2.0, easeinoutquad);
  delete(global.customtransition); delete(global.customtransitiontime); set(control.invert,false);
</action>
`;

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
    let all_hotspot = "";
    let all_hotspot_dollhouse = "";
    let all_dollhouse_actions = "";
    let all_scene = "";
    let xml_style = "";

    for (const property in xmlStyle) {
      xml_style += `\n${xmlStyle[property]}`;
    }

    let xml = new XMLParser().parseFromString(`<array
                name="integer_array_name">${xml_style}</array>`);
    let array = xml.getElementsByTagName("array");

    for (let i = 0, j = array[0].children.length; i < j; i++) {
      let pn = array[0].children[i];
      let pano_id = pn.attributes.linkedscene.trim().split("pano")[1];

      all_hotspot += hotSpotTemplate({
        name: `hotspot_${pano_id}`,
        style: hotSpotStyleName,
        x: pn.attributes.ox,
        y: pn.attributes.oy,
        z: pn.attributes.oz,
        distance: cameraDistance,
        handler: `tour3d_loadscene(scene_pano${pano_id});`,
      });

      all_hotspot_dollhouse += hotSpotTemplate({
        name: `hotspot_dollhouse_${pano_id}`,
        style: hotSpotStyleName,
        x: pn.attributes.ox,
        y: pn.attributes.oy,
        z: pn.attributes.oz,
        distance: cameraDistance,
        handler: `transition_dh_to_scene_pano${pano_id}();`,
      });

      all_dollhouse_actions += hotSpotDollhouseActionTemplate(
        pano_id,
        pn.attributes.ox,
        pn.attributes.oy,
        pn.attributes.oz
      );
    }

    for (let i = 0, j = array[0].children.length; i < j; i++) {
      let pn = array[0].children[i];
      let pano_id = pn.attributes.linkedscene.trim().split("pano")[1];
      all_scene += sceneTemplate(pano_id, all_hotspot, imageResolution);
    }

    let dollhouse_scene = sceneDollhouseOrFloorTemplate(
      true,
      all_hotspot_dollhouse
    );
    let floor_scene = "";

    Array.from(Array(floorNumber), (e, i) => {
      let xmlStylePerFloor = xmlStyle[i];
      let xml = new XMLParser().parseFromString(`<array
                name="integer_array_name">${xmlStylePerFloor}</array>`);
      let array = xml.getElementsByTagName("array");
      let hotspots_per_floor = "";
      let hotspots_per_dollhouse = "";

      for (let i = 0, j = array[0].children.length; i < j; i++) {
        let pn = array[0].children[i];
        let pano_id = pn.attributes.linkedscene.trim().split("pano")[1];

        hotspots_per_dollhouse += hotSpotTemplate({
          name: `hotspot_dollhouse_${pano_id}`,
          style: hotSpotStyleName,
          x: pn.attributes.ox,
          y: pn.attributes.oy,
          z: pn.attributes.oz,
          distance: cameraDistance,
          handler: `transition_dh_to_scene_pano${pano_id}();`,
        });

        hotspots_per_floor += hotSpotTemplate({
          name: `hotspot_floorplan_${pano_id}`,
          style: hotSpotStyleName,
          x: pn.attributes.ox,
          y: pn.attributes.oy,
          z: pn.attributes.oz,
          distance: cameraDistance,
          handler: `transition_dh_to_scene_pano${pano_id}();`,
        });
      }

      dollhouse_scene += sceneDollhouseOrFloorTemplate(
        true,
        hotspots_per_dollhouse,
        {
          name: `Dollhouse${i + 1}`,
          title: `Dollhouse${i + 1}`,
          style: `Style_Dollhouse${i + 1}`,
          sphereURL: `dollhouse/bake${i + 1}.jpg`,
          depthmapURL: `dollhouse/tang${i + 1}.obj`,
        }
      );

      floor_scene += sceneDollhouseOrFloorTemplate(false, hotspots_per_floor, {
        name: `Floorplan${i + 1}`,
        title: `Floorplan${i + 1}`,
        style: `Style_floorplan${i + 1}`,
        sphereURL: `dollhouse/bake${i + 1}.jpg`,
        depthmapURL: `dollhouse/tang${i + 1}.obj`,
      });
      return;
    });

    all_scene += dollhouse_scene;
    all_scene += floor_scene;

    let all_dollhouses = dollhouseTemplate(1);

    let xml_result = krpanoTemplate(
      xml_style,
      all_scene,
      all_dollhouses,
      all_dollhouse_actions
    );
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
