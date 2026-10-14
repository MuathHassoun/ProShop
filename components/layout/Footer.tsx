import Link from 'next/link';

export default function Footer() {
    return (
        <footer>
            <nav className='dark:bg-black dark:text-white flex items-center justify-around p-3'>
                <div>
                    <h2 className='text-[20px] font-bold'>
                        &copy; 2026 <span className='text-yellow-400'> </span>
                        <Link href="/">
                            <span className='text-yellow-400'>Pro</span>Shop
                        </Link>
                    </h2>
                </div>
            </nav>
        </footer>
    );
}
