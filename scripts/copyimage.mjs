import fs from 'fs'
import fsExtra from 'fs-extra'
import glob from 'glob'

const source = './data/blog'
const destination = './public/blog'

fsExtra.emptyDirSync(destination)

try {
  // 다복사
  fsExtra.copySync(source, destination, { overwrite: true })

  // md 삭제
  glob(`${destination}/**/*.@(md|mdx)`, function (er, files) {
    //console.log('files', files)
    for (const file of files) {
      fs.unlinkSync(file)
    }
  })
} catch (err) {
  console.error(err)
}
