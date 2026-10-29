import {chromium,expect} from '@playwright/test'
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}})
 const errors=[]; page.on('pageerror',e=>errors.push(e.message))
 await page.addInitScript(()=>{
  window.modelPhotoFlashes=[]
  new MutationObserver(()=>{
   for(const root of document.querySelectorAll('[data-category-hero-models], [data-studio-piece-picker], [data-award-stage]')){
    if(root.querySelector('img'))window.modelPhotoFlashes.push(root.getAttributeNames().join(','))
   }
  }).observe(document,{subtree:true,childList:true})
 })
 await page.goto('http://localhost:3000/',{waitUntil:'networkidle'})
 console.log('hero',width,await page.locator('[data-home-hero] picture img').evaluate(img=>({src:img.currentSrc,complete:img.complete,overflow:document.documentElement.scrollWidth>innerWidth})))
 await page.screenshot({path:`studio-hero-${width}.png`})
 await page.goto('http://localhost:3000/customize?piece=achievement',{waitUntil:'networkidle'})
 const picker=page.locator('[data-studio-piece-picker]')
 await picker.scrollIntoViewIfNeeded()
 await expect(picker).toHaveAttribute('aria-busy','false')
 const a=await picker.screenshot({path:`studio-picker-${width}.png`});await page.waitForTimeout(600);const b=await picker.screenshot()
 console.log('picker',width,{rotating:!a.equals(b),photoFlashes:await page.evaluate(()=>window.modelPhotoFlashes),url:page.url(),errors})
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(250)
 const c=await picker.screenshot();await page.waitForTimeout(400);const d=await picker.screenshot()
 console.log('reduced',width,c.equals(d))
 await picker.getByRole('link',{name:'Ascent Figure Award',exact:true}).click()
 await expect(page).toHaveURL(/piece=ascent/)
 await expect(page.locator('[data-studio-piece-picker] a[aria-current="page"]')).toHaveAttribute('aria-label','Ascent Figure Award')
 console.log('selection',width,'passed')
 await page.close()
}
const page=await browser.newPage({reducedMotion:'reduce'})
for(const route of ['artwork','furniture','trophies']){
 await page.goto('http://localhost:3000/'+route,{waitUntil:'networkidle'})
 const stage=page.locator('[data-category-hero-models]')
 await expect(stage).toHaveAttribute('aria-busy','false')
 await expect(stage.locator('img')).toHaveCount(0)
 console.log('collection3DOnly',route,true)
}
await browser.close()
