import { unlink} from 'fs/promises'

export const DeleteLocalFile = async (...paths)=>{
    if (!paths.length){
        console.log('No file Provided to delete')
        return;
    }

    for (const path of paths){
        if(typeof path !== 'string'){
            console.warn(`Skipping non-string path:`, path)
            continue
        }

        try{
            await unlink(path);
            console.log(`Deleted: ${path}`)
        } catch(error){
            console.error(`Error deleting ${path}`, error.message)
        }

    }
    console.log('Task Compete')
}