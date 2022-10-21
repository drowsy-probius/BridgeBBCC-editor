export function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}

export async function imageBufferLoaderFromIcon (icon, iconDirectory) {
  let buffer;
  if(icon.uri !== undefined && icon.uri.startsWith("http"))
  {
    buffer = await window.api.getBufferFromUrl(icon.uri);
  }
  else if(icon.url !== undefined && icon.url.startsWith("http"))
  {
    buffer = await window.api.getBufferFromUrl(icon.url);
  }
  else 
  {
    buffer = await window.fs.readFileSync(`${iconDirectory}/${icon.name}`);
  }

  return buffer;
}

export function imageExtFromIcon (icon) {
  let ext = "webp";
  if(icon.uri !== undefined && icon.uri.startsWith("http"))
  {
    ext = icon.uri.split('.').pop();
  }
  else if(icon.url !== undefined && icon.url.startsWith("http"))
  {
    ext = icon.url.split('.').pop();
  }
  else 
  {
    ext = icon.name.split('.').pop();
  }
  return ext;
}

export async function imageBase64FromIcon(icon, iconDirectory) {
  return `data:image/${imageExtFromIcon(icon)};base64,${arrayBufferToBase64(await imageBufferLoaderFromIcon(icon, iconDirectory))}`;
}
 
export function iconValidationChecker(icon, iconIdx, iconList) {

  for(let i=0; i<iconList.length; i++)
  {
    if(i === iconIdx) continue;

    const currentIcon = iconList[i];

    /**
     * name check
     */
    if(icon.name === currentIcon.name)
    {
      return {
        status: false,
        message: {
          key: "name",
          value: icon.name,
          conflict: i,
        }
      }
    }

    /**
     * keywords check
     */
    for(let ik=0; ik<icon.keywords.length; ik++)
    {
      for(let ilk=0; ilk<currentIcon.keywords.length; ilk++)
      {
        if(icon.keywords[ik] === currentIcon.keywords[ilk])
        {
          return {
            status: false,
            message: {
              key: "keywords",
              value: icon.keywords,
              conflict: i,
            }
          }
        }
      }
    }
  }

  return {
    status: true,
    message: {},
  };
}

export async function saveIconListToFile(iconListPath, iconList) {
  const result = await window.fs.writeFileSync(iconListPath, JSON.stringify(iconList, null, 2), {encoding: "utf8", flag: "w"});
  return result;
}