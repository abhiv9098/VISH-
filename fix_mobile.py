import re

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        content = content.replace('<table className="w-full text-left border-collapse">', '<table className="w-full text-left border-collapse block md:table">')
        content = content.replace('<thead>', '<thead className="hidden md:table-header-group">')
        content = content.replace('<tbody className="divide-y divide-gray-100 text-sm">', '<tbody className="block md:table-row-group divide-y divide-gray-200 md:divide-gray-100 text-sm">')
        content = content.replace('<tr key={order.id} className="hover:bg-amber-50/40 transition">', '<tr key={order.id} className="block md:table-row hover:bg-amber-50/40 transition p-4 md:p-0 border-b border-gray-200 md:border-b-0 mb-4 md:mb-0 bg-white rounded-lg md:rounded-none shadow-sm md:shadow-none">')
        content = content.replace('<td className="p-4 align-top">', '<td className="block md:table-cell px-2 py-3 md:p-4 align-top border-b border-gray-50 md:border-b-0">')
        content = content.replace('<td className="p-4 align-top min-w-[250px]">', '<td className="block md:table-cell px-2 py-3 md:p-4 align-top md:min-w-[250px] border-b border-gray-50 md:border-b-0">')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Processed {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

process_file('src/app/admin/page.tsx')
process_file('src/app/admin/orders/page.tsx')
