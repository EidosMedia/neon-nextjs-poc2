import React from 'react'
import { Button } from './button'
import { Copy, Edit, Ghost, Mail, Target } from 'lucide-react'

const TempEntryPage = () => {
  
  return (
    <div className='flex'>
      <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
          <Button > <Mail /> Primary</Button>
          <Button variant='secondary'  ><Edit />Secondary</Button>
          <Button variant='ghost' ><Ghost />Ghost</Button>
          <Button variant='title' ><Copy />Title</Button>
      </div>
      <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
        <Button > <Mail /> </Button>
        <Button variant='secondary'><Edit /></Button>
        <Button variant='ghost' ><Ghost /></Button>
        <Button variant='title' ><Copy /></Button>
      </div>
      <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
        <Button disabled > <Mail /> Disabled</Button>
        <Button disabled variant='secondary'  ><Edit />Disabled</Button>
        <Button disabled variant='ghost' ><Ghost />Disabled</Button>
        <Button disabled variant='title' ><Copy />Disabled</Button>
      </div>
      <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
        <Button disabled > <Mail /> </Button>
        <Button disabled variant='secondary'  ><Edit /></Button>
        <Button disabled variant='ghost' ><Ghost /></Button>
        <Button disabled variant='title' ><Copy /></Button>
      </div>
    </div>
  )
}

export default TempEntryPage