const WebpageFooter: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="container mx-auto px-4 py-6 bg-gray-200 text-gray-900">
            <div className="flex flex-wrap justify-center gap-8">

                <div className="w-48">
                    <h2 className="text-lg font-bold">Eidosmedia</h2>
                    <p className="text-sm break-words">
                        Eidosmedia, excellence in headless CMS and Enterprise content publishing systems.
                    </p>
                    <p className="text-sm break-words">Hybrid CMS and other FAQs</p>
                </div>

                <div className="w-48">
                    <h2 className="text-lg font-bold">Platform & Solutions</h2>
                    <ul className="text-sm space-y-1 break-words">
                        <li>The Eidosmedia ecosystem</li>
                        <li>Authoring</li>
                        <li>Automation</li>
                        <li>Orchestration</li>
                        <li>Digital Delivery</li>
                        <li>Asset Management</li>
                        <li>Extensibility</li>
                    </ul>
                </div>

                <div className="w-48">
                    <h2 className="text-lg font-bold">Industries</h2>
                    <ul className="text-sm space-y-1 break-words">
                        <li>Investment Research</li>
                        <li>Media Publishing</li>
                    </ul>
                </div>

                <div className="w-48">
                    <h2 className="text-lg font-bold">Support</h2>
                    <ul className="text-sm space-y-1 break-words">
                        <li>Developers Foundry</li>
                        <li>Academy</li>
                    </ul>
                </div>

                <div className="w-48">
                    <h2 className="text-lg font-bold">About</h2>
                    <ul className="text-sm space-y-1 break-words">
                        <li>About Eidosmedia</li>
                        <li>Media case studies</li>
                        <li>Research case studies</li>
                        <li>Contacts</li>
                        <li>Life at Eidos</li>
                        <li>Careers</li>
                        <li>Find your job position</li>
                        <li>Partner Program</li>
                    </ul>
                </div>

                <div className="w-48">
                    <h2 className="text-lg font-bold">News & Info</h2>
                    <ul className="text-sm space-y-1 break-words">
                        <li>Press Release</li>
                        <li>Updater</li>
                        <li>Privacy Policy</li>
                        <li>Copyright Protection</li>
                        <li>Whistleblowing</li>
                    </ul>
                </div>
            </div>

            <div className="text-center text-gray-600 text-sm mt-6">
                <p>Copyright © 2024 Eidosmedia S.p.A. - P.IVA IT11881420159 - All rights reserved.</p>
                <div className="flex justify-center space-x-4 mt-2">
                    <a href="#" className="text-gray-700 hover:text-gray-900"><i className="fab fa-twitter"></i></a>
                    <a href="#" className="text-gray-700 hover:text-gray-900"><i className="fab fa-facebook"></i></a>
                    <a href="#" className="text-gray-700 hover:text-gray-900"><i className="fab fa-linkedin"></i></a>
                </div>
            </div>
        </div>
    );
};

export default WebpageFooter;