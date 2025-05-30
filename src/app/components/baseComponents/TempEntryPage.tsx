'use client';
import { Button } from './button';
import { Copy, Edit, Ghost, Mail, Search } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Input } from './textInput';
import Select from './select';
import { ReactNode } from 'react';

const TempEntryPage = () => {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const optArr = [
    { value: 'apple sdfg', text: 'Apple long text' },
    { value: 'banana', text: 'Banana' },
  ];

  return (
    <div className="p-6">
      <ComponentsContainer title="Buttons">
        <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
          <Button>
            {' '}
            <Mail /> Primary
          </Button>
          <Button variant="secondary">
            <Edit />
            Secondary
          </Button>
          <Button variant="ghost">
            <Ghost />
            Ghost
          </Button>
          <Button variant="title">
            <Copy />
            Title
          </Button>
        </div>
        <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
          <Button>
            {' '}
            <Mail />{' '}
          </Button>
          <Button variant="secondary">
            <Edit />
          </Button>
          <Button variant="ghost">
            <Ghost />
          </Button>
          <Button variant="title">
            <Copy />
          </Button>
        </div>
        <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
          <Button disabled>
            {' '}
            <Mail /> Disabled
          </Button>
          <Button disabled variant="secondary">
            <Edit />
            Disabled
          </Button>
          <Button disabled variant="ghost">
            <Ghost />
            Disabled
          </Button>
          <Button disabled variant="title">
            <Copy />
            Disabled
          </Button>
        </div>
        <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
          <Button disabled>
            {' '}
            <Mail />{' '}
          </Button>
          <Button disabled variant="secondary">
            <Edit />
          </Button>
          <Button disabled variant="ghost">
            <Ghost />
          </Button>
          <Button disabled variant="title">
            <Copy />
          </Button>
        </div>
        {/* SMALL SIZE BUTTONS */}
        <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
          <Button size="sm">
            {' '}
            <Mail /> Primary
          </Button>
          <Button size="sm" variant="secondary">
            <Edit />
            Secondary
          </Button>
          <Button size="sm" variant="ghost">
            <Ghost />
            Ghost
          </Button>
          <Button size="sm" variant="title">
            <Copy />
            Title
          </Button>
        </div>
        <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
          <Button size="sm">
            {' '}
            <Mail />{' '}
          </Button>
          <Button size="sm" variant="secondary">
            <Edit />
          </Button>
          <Button size="sm" variant="ghost">
            <Ghost />
          </Button>
          <Button size="sm" variant="title">
            <Copy />
          </Button>
        </div>
        <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
          <Button size="sm" disabled>
            {' '}
            <Mail /> Disabled
          </Button>
          <Button size="sm" disabled variant="secondary">
            <Edit />
            Disabled
          </Button>
          <Button size="sm" disabled variant="ghost">
            <Ghost />
            Disabled
          </Button>
          <Button size="sm" disabled variant="title">
            <Copy />
            Disabled
          </Button>
        </div>
        <div className="flex gap-4 flex-col w-fit p-8 font-epilogue">
          <Button size="sm" disabled>
            {' '}
            <Mail />{' '}
          </Button>
          <Button size="sm" disabled variant="secondary">
            <Edit />
          </Button>
          <Button size="sm" disabled variant="ghost">
            <Ghost />
          </Button>
          <Button size="sm" disabled variant="title">
            <Copy />
          </Button>
        </div>
      </ComponentsContainer>
      <ComponentsContainer title="Inputs">
        <div className="flex flex-col gap-6 font-epilogue">
          <Input Icon={<Search />} placeholder="Ask The Globe w/ Icon" />
          <Input placeholder="Ask The Globe" />
          <Input Icon={<Search />} disabled placeholder="Disabled w/ Icon" />
          <Input disabled placeholder="Disabled" />
        </div>
      </ComponentsContainer>
      <ComponentsContainer title="Dropdown" className="flex-col gap-2 ">
        <Select
          options={optArr}
          onChange={function (value: string): void {
            throw new Error('Function not implemented.');
          }}
        />
        <Select
          options={[{ value: 'Disabled', text: 'Disabled' }]}
          onChange={function (value: string): void {
            throw new Error('Function not implemented.');
          }}
        />
      </ComponentsContainer>
    </div>
  );
};

type ComponentsContainerProps = {
  className?: string;
  children: ReactNode;
  title: string;
};

export const ComponentsContainer = ({ className = '', children, title }: ComponentsContainerProps) => {
  return (
    <>
      <h2 className="text-fuchsia-800">{title}</h2>
      <br />
      <div
        className={`flex w-fit rounded border-2 border-fuchsia-800 border-dashed p-6 font-epilogue mb-8 ${className}`}
      >
        {children}
      </div>
    </>
  );
};

export default TempEntryPage;
