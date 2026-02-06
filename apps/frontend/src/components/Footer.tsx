export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              🦉 HOOTNER
            </h3>
            <p className="text-sm text-gray-300 mt-1">Where AI Meets Human Creativity</p>
          </div>
          
          <div className="flex gap-8 text-sm">
            <a href="/docs" className="hover:text-cyan-400 transition">Docs</a>
            <a href="/pricing" className="hover:text-cyan-400 transition">Pricing</a>
            <a href="/contact" className="hover:text-cyan-400 transition">Contact</a>
            <a href="https://github.com" className="hover:text-cyan-400 transition">GitHub</a>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} HOOTNER. Quantum-Native Video Intelligence Platform.
        </div>
      </div>
    </footer>
  )
}
