import * as JSON5 from "json5";
import { IMAGE_EXTENSIONS } from "../../constants";

const ICON_KEYS = {
  NAME: "name",
  KEYWORDS: "keywords",
  TAGS: "tags",
  URI: "uri",
  URL: "url",
};

export const PLACEHOLDERS = {
  NAME: "이미지를 선택하면 제가 입력할게요.",
  KEYWORDS: "[필수] 컴마(,)으로 구분된 키워드 목록이에요.",
  TAGS: "[필수] 컴마(,)으로 구분된 태그 목록이에요.",
  URL: "외부 이미지를 사용하려면 이미지 주소를 입력해요.",
}

function createErrorObject(key, message="", level=0, args={}) {
  return {
    key: key,
    message: message,
    level: level,
    ...args
  }
}

function comparePath(path1, path2) {
  return path1.replaceAll("\\", "/") === path2.replaceAll("\\", "/");
}

/**
 * string이고 (http:// | https://)으로 시작하면 true
 * @param {*} str 
 * @returns 
 */
export function isUrl(str) {
  return (
    typeof(str) === "string" && 
    (
      str.startsWith("http://") || 
      str.startsWith("https://")
    )
  )
}

export function isImage(str) {
  return (
    IMAGE_EXTENSIONS.includes(str.split('.').pop())
  );
}

export function isValidString(str) {
  return (
    typeof(str) === "string" && 
    str.length > 0
  );
}

export function isValidStringArray(array) {
  return (
    Array.isArray(array) && 
    array.length > 0 &&
    array.filter(i => typeof(i) !== "string").length === 0
  );
}

/**
 * `str`가 `string`인데 `http`로 시작하지 않으면 false
 * @param {*} str 
 * @returns 
 */
export function isValidOptionalUrl(str) {
  return (
    ( !isValidString(str) )||
    (
      isUrl(str)
    )
  );
}

export function isValidImageSource(str) {
  return (
    isImage(str) || isUrl(str)
  )
}

/**
 * `icon`에는 이미지 주소 아니면 $localPath 둘 중 하나는 있어야 한다.
 * @param {} icon 
 * @returns 
 */
export function getImageSource(icon) {
  if(isUrl(icon.url))
  {
    return icon.url
  }
  if(isUrl(icon.uri))
  {
    return icon.uri
  }
  if(isUrl(icon.path))
  {
    return icon.path
  }
  return icon.$localPath;
}



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


export async function imageBase64FromUri(imagePath) {
  try 
  {
    const ext = (typeof(imagePath) !== "string") ? "webp"
    : imagePath.startsWith("http") ? "webp" : imagePath.split('.').pop();
    return `data:image/${ext};base64,${arrayBufferToBase64(await imageBufferLoaderFromUri(imagePath))}`;
  }
  catch(err)
  {
    return createErrorObject("image", `${imagePath}는 이미지가 아닌 것 같아요`);
  }
}


export function sanitizeIcon(icon)
{
  return {
    ...icon,
    keywords: icon.keywords.filter(i => i.length > 0),
    tags: icon.tags.filter(i => i.length > 0),
  };
}


/**
 * icon의 항목이 유일하면 `true`를 리턴함.
 * 아니라면 상세 메시지를 리턴함.
 * @param {*} icon 
 * @param {*} iconIdx 
 * @param {*} iconList 
 * @returns 
 */
export function isUniqueIcon(icon, iconIdx, iconList) {
  for(let i=0; i<iconList.length; i++)
  {
    if(i === iconIdx) continue;

    const currentIcon = iconList[i];

    /**
     * name check
     */
    if(!isValidString(currentIcon.name))
    {
      return createErrorObject(
        ICON_KEYS.NAME,
        `아래 value에 있는 아이콘에 name 항목이 없어요. 포맷 검증을 먼저 해주세요.`,
        0,
        {
          value: currentIcon,
          conflict: i,
        }
      )
    }
    if(icon.name === currentIcon.name)
    {
      return createErrorObject(
        ICON_KEYS.NAME,
        `같은 name을 가지는 아이콘이 있어요.`,
        0,
        {
          value: [icon, currentIcon],
          conflict: i,
        }
      )
    }

    /**
     * keywords check
     */
    if(!isValidStringArray(currentIcon.keywords))
    {
      return createErrorObject(
        ICON_KEYS.KEYWORDS,
        `아래 value에 적혀있는 아이콘에 keywords가 없어요. 포맷 검증을 한 뒤에 추가해주세요.`,
        0,
        {
          value: currentIcon,
          conflict: i,
        }
      )
    }

    for(let ik=0; ik<icon.keywords.length; ik++)
    {
      for(let ilk=0; ilk<currentIcon.keywords.length; ilk++)
      {
        if(icon.keywords[ik] === currentIcon.keywords[ilk])
        {
          return createErrorObject(
            ICON_KEYS.KEYWORDS,
            `중복되는 keyword가 있어요.`,
            0,
            {
              value: [icon, currentIcon],
              conflict: i,
            }
          )
        }
      }
    }
  }

  return true;
}

/**
 * icon에 에러가 있다면 리스트 형식으로 리턴함.
 * 없다면 빈 리스트.
 * @param {*} icon 
 * @returns 
 */
export function findErrorsInIcon(icon) {
  const errors = [];

  if(!isValidString(icon.name))
  {
    errors.push(createErrorObject(
      ICON_KEYS.NAME, 
      "name 항목은 있어야 해요.",
      0,
      {
        value: icon.name
      }
    ));
  }

  if(!isValidStringArray(icon.keywords))
  {
    errors.push(createErrorObject(
      ICON_KEYS.KEYWORDS,
      `keywords 항목은 있어야 해요.`,
      0,
      {
        value: icon.keywords
      }
    ));
  }

  if(!isValidStringArray(icon.tags))
  {
    errors.push(createErrorObject(
      ICON_KEYS.TAGS, 
      `tags 항목은 있어야 해요. 없으면 '미지정'이라고 적어주세요.`,
      0,
      {
        value: icon.tags
      }
    ));
  }

  if(!isValidOptionalUrl(icon.url))
  {
    errors.push(createErrorObject(
      ICON_KEYS.URL, 
      `url 항목은 http로 시작하는 주소이어야 해요.`,
      0,
      {
        value: icon.url
      }
    ));
  }

  if(!isValidOptionalUrl(icon.uri))
  {
    errors.push(createErrorObject(
      ICON_KEYS.URI, 
      `uri 항목은 http로 시작하는 주소이어야 해요.`,
      0,
      {
        value: icon.uri
      }
    ));
  }

  return errors;
}

export function findErrorsInIconList(iconList) {
  /**
   * {
   *   key: name|keywords|url,
   *   level: 0, // lower is higher
   *   conflict: [
   *     { icon1 },
   *     { icon2? }
   *   ],
   *   message?: "",
   * }
   */
  const errors = [];

  for(let i=0; i<iconList.length; i++)
  {
    const icon = iconList[i];

    const iconErrors = findErrorsInIcon(icon);
    if(iconErrors.length > 0){
      iconErrors.forEach(error => {
        errors.push({
          ...error,
          value: icon
        })
      });
      continue;
    }

    for(let innerIdx=i+1; innerIdx<iconList.length; innerIdx++)
    {
      const innerIcon = iconList[innerIdx];
      if(icon.name === innerIcon.name)
      {
        errors.push(createErrorObject(
          ICON_KEYS.NAME, 
          `사실 name이 같아도 동작은 하지만 다르게 하는 것이 맞는 것 같아요...`,
          level=3,
          {
            conflict: [icon, innerIcon]
          }
        ));
      }

      for(let keywordIdx=0; keywordIdx<icon.keywords.length; keywordIdx++)
      {
        if(innerIcon.keywords.includes(icon.keywords[keywordIdx]))
        {
          errors.push(createErrorObject(
            ICON_KEYS.KEYWORDS,
            `keywords는 겹치면 안돼요!`,
            level=0,
            {
              conflict: [icon, innerIcon]
            }
          ));
        }
      }
    }
  }
    
  return errors;
}


export async function moveImage(from, to) {
  if(comparePath(from, to))
  {
    return true;
  }

  if(await window.fs.isFile(to))
  {
    return createErrorObject('', `${to}에 이미 파일이 있어요!`)
  }

  if(!(await window.fs.isFile(from)))
  {
    return createErrorObject('', `${from}에 파일이 없어요!`);
  }

  const res = await window.fs.renameSync(from, to);
  if(res.status === false)
  {
    return createErrorObject('', res.error);
  }

  return true;
}


export async function copyImage(from, to) {
  if(comparePath(from, to))
  {
    return true;
  }

  if(await window.fs.isFile(to))
  {
    return createErrorObject('', `${to}에 이미 파일이 있어요!`)
  }

  if(!(await window.fs.isFile(from)))
  {
    return createErrorObject('', `${from}에 파일이 없어요!`);
  }

  const res = await window.fs.copyFileSync(from, to);
  if(res.status === false)
  {
    return createErrorObject('', res.error);
  }

  return true;
}

/**
 * js 데이터 저장
 * @param {*} iconList 
 * @param {*} appPath 
 * @returns 
 */
export async function saveIconListToFile(iconList, appPath) {
  /**
   * 키가 $으로 시작하거나
   * 값 길이가 1 이상인 것만 저장함.
   */
  const jsonData = iconList.map(icon => Object.fromEntries(Object.entries(icon)
    .filter(([key, value]) => (
      !key.startsWith("$") && 
      value.length > 0
    )))
  );
  const textData = `dcConsData = ${JSON5.stringify(jsonData, null ,2)};`;
  const result = await window.fs.writeFileSync(appPath.iconList, textData, {encoding: "utf8", flag: "w"});
  return result;
}
