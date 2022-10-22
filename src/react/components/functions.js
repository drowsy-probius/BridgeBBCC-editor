export function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array( buffer );
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
      binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}

export async function imageBufferLoaderFromUri(imagePath) {
  if(typeof(imagePath) === "string" && imagePath.startsWith("http"))
  {
    return await window.api.getBufferFromUrl(imagePath);;
  }
  return await window.fs.readFileSync(imagePath);;
}

export async function imageBufferLoaderFromIcon (icon, iconDirectory) {
  let buffer;
  if(typeof(icon.uri) === "string" && icon.uri.startsWith("http"))
  {
    buffer = await imageBufferLoaderFromUri(icon.uri);
  }
  else if(typeof(icon.url) === "string" && icon.url.startsWith("http"))
  {
    buffer = await imageBufferLoaderFromUri(icon.url);
  }
  else 
  {
    buffer = await imageBufferLoaderFromUri(`${iconDirectory}/${icon.name}`);
  }

  return buffer;
}

export function imageExtFromIcon (icon) {
  let ext = "webp";
  if(typeof(icon.uri) === "string" && icon.uri.startsWith("http"))
  {
    ext = icon.uri.split('.').pop();
  }
  else if(typeof(icon.url) === "string" && icon.url.startsWith("http"))
  {
    ext = icon.url.split('.').pop();
  }
  else 
  {
    ext = icon.name.split('.').pop();
  }
  return ext;
}

export async function imageBase64FromUri(imagePath) {
  const ext = (typeof(imagePath) !== "string") ? "webp"
  : imagePath.startsWith("http") ? "webp" : imagePath.split('.').pop();
  return `data:image/${ext};base64,${arrayBufferToBase64(await imageBufferLoaderFromUri(imagePath))}`;
}

export async function imageBase64FromIcon(icon, iconDirectory) {
  return `data:image/${imageExtFromIcon(icon)};base64,${arrayBufferToBase64(await imageBufferLoaderFromIcon(icon, iconDirectory))}`;
}
 
export function isUniqueIcon(icon, iconIdx, iconList) {

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

export function isValidIcon(icon) {
  if(!icon.name || typeof(icon.name) !== "string" || icon.name.length === 0) return false;
  if(!icon.keywords || !Array.isArray(icon.keywords) || icon.keywords.length === 0) return false;
  if(!icon.tags || !Array.isArray(icon.tags) || icon.tags.length === 0) return false;

  return true;
}

export function findErrorsInIconList(iconList) {
  /**
   * {
   *   key: name|keywords|url,
   *   conflict: [
   *     { icon },
   *     { icon },
   *     ...
   *   ]
   * }
   */
  const errors = [];
    
  return errors;
}

export async function saveIconListToFile(iconList, appPath) {
  const copiedIconList = await Promise.all(iconList.map(async (icon) => {
    if(icon.$localPath === undefined || icon.$localPath.length === 0) return icon;
    if(icon.$localPath.startsWith(appPath.iconDirectory)) return icon;

    const res = await window.fs.copyFileSync(icon.$localPath, `${appPath.iconDirectory}/${icon.name}`);
    if(res.status === false)
    {
      console.error(res.error);
      throw new Error(res.error);
    }
    return icon;
  }));

  const jsonData = copiedIconList.map(icon => Object.fromEntries(Object.entries(icon)
    .filter(([key, value]) => (
      !key.startsWith("$") && 
      value.length > 0
    )))
  );
  const textData = `dcConsData = ${JSON.stringify(jsonData, null ,2)};`;
  const result = await window.fs.writeFileSync(appPath.iconList, textData, {encoding: "utf8", flag: "w"});
  return result;
}
